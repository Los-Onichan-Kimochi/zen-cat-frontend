import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authService } from '@/api/auth/auth-service';
import Cookies from 'js-cookie';

// Usando la interfaz simplificada para el contexto
export interface User {
  id?: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  role?: string;
  rol?: string; // Backend uses 'rol' field
  isAuthenticated?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isClient: () => boolean;
  isAdministrator: () => boolean;
  hasRole: (role: string) => boolean;
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
    try {
      const savedUser = localStorage.getItem('user');
      const hasAccessToken = !!Cookies.get('access_token');

      if (savedUser && hasAccessToken) {
        const userData = JSON.parse(savedUser);
        // Verificar que no sea administrador
        if (
          userData.rol === 'ADMINISTRATOR' ||
          userData.role === 'ADMINISTRATOR'
        ) {
          console.log('AuthProvider: Administrator detected, clearing session');
          localStorage.removeItem('user');
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          setUser(null);
        } else {
          console.log(
            'AuthProvider: Found saved user with valid tokens:',
            userData,
          );
          setUser(userData);
        }
      } else if (savedUser && !hasAccessToken) {
        console.log(
          'AuthProvider: Found saved user but no access token, clearing localStorage',
        );
        localStorage.removeItem('user');
        setUser(null);
      } else {
        console.log('AuthProvider: No saved user found');
        setUser(null);
      }
    } catch (error) {
      console.error('AuthProvider: Error parsing saved user:', error);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    console.log('AuthProvider: Login called with:', userData);
    // Verificar que no sea administrador antes de hacer login
    if (userData.rol === 'ADMINISTRATOR' || userData.role === 'ADMINISTRATOR') {
      console.error('AuthProvider: Administrator cannot login to client app');
      throw new Error(
        'Los administradores no pueden acceder a la aplicación de clientes',
      );
    }
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

  const isClient = () => {
    return user?.rol === 'CLIENT' || user?.role === 'CLIENT';
  };

  const isAdministrator = () => {
    return user?.rol === 'ADMINISTRATOR' || user?.role === 'ADMINISTRATOR';
  };
  const hasRole = (role: string) => {
    return user?.rol === role || user?.role === role;
  };

  // Check both user state and actual token presence
  const hasAccessToken = !!Cookies.get('access_token');
  const isAuthenticated = !!user?.isAuthenticated && hasAccessToken;

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    isClient,
    isAdministrator,
    hasRole,
  };

  console.log('AuthProvider: Context value:', {
    hasUser: !!user,
    hasAccessToken,
    isAuthenticated,
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
