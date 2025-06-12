import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { User } from '@/types/user';
import Cookies from 'js-cookie';

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
    console.log('AuthProvider: Checking saved user...');
    try {
      const savedUser = localStorage.getItem('user');
      const hasAccessToken = !!Cookies.get('access_token');
      
      if (savedUser && hasAccessToken) {
        const userData = JSON.parse(savedUser);
        console.log('AuthProvider: Found saved user with valid tokens:', userData);
        setUser(userData);
      } else if (savedUser && !hasAccessToken) {
        console.log('AuthProvider: Found saved user but no access token, clearing localStorage');
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
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('AuthProvider: Logout called');
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Check both user state and actual token presence
  const hasAccessToken = !!Cookies.get('access_token');
  const isAuthenticated = !!user && hasAccessToken;

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  console.log('AuthProvider: Context value:', {
    hasUser: !!user,
    hasAccessToken,
    isAuthenticated,
    isLoading,
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
