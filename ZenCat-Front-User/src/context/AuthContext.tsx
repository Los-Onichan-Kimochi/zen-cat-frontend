import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authService } from '@/api/auth/auth-service';

// Usando la interfaz simplificada para el contexto
export interface User {
  id?: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  role?: string;
  isAuthenticated?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Checking authentication status...');

    const initializeAuth = async () => {
      try {
        // First check if there are tokens in cookies
        if (authService.isAuthenticated()) {
          console.log('AuthProvider: Found tokens, fetching current user...');

          // Try to get current user info from server
          const currentUser = await authService.getCurrentUser();
          const userData: User = {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            imageUrl: currentUser.imageUrl || currentUser.avatar,
            role: currentUser.role,
            isAuthenticated: true,
          };

          console.log('AuthProvider: Successfully loaded user:', userData);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Check localStorage as fallback (for compatibility)
          console.log(
            'AuthProvider: No tokens found, checking localStorage...',
          );
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            console.log(
              'AuthProvider: Found saved user in localStorage:',
              userData,
            );
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('AuthProvider: Error during initialization:', error);
        // Clear any invalid data
        authService.logout();
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User) => {
    console.log('AuthProvider: Login called with:', userData);
    const userWithAuth = { ...userData, isAuthenticated: true };
    setUser(userWithAuth);
    localStorage.setItem('user', JSON.stringify(userWithAuth));
  };

  const logout = async () => {
    console.log('AuthProvider: Logout called');
    try {
      await authService.logout();
    } catch (error) {
      console.warn('AuthProvider: Server logout failed:', error);
    }

    setUser(null);
    localStorage.removeItem('user');

    // Redirect to home instead of login for better UX in user frontend
    window.location.href = '/';
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user?.isAuthenticated,
    isLoading,
    login,
    logout,
  };

  console.log('AuthProvider: Context value:', {
    hasUser: !!user,
    isAuthenticated: !!user?.isAuthenticated,
    isLoading,
    userEmail: user?.email,
  });

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
