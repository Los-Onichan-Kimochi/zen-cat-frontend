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

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('user');
    const hasAccessToken = !!Cookies.get('access_token');

    console.log('AuthProvider: Stored user exists:', !!storedUser);
    console.log('AuthProvider: Access token exists:', hasAccessToken);

    if (storedUser && hasAccessToken) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('AuthProvider: Restoring user from localStorage:', userData);
        
        // Asegurar que el usuario tenga rol CLIENT si no tiene rol definido
        if (!userData.rol && !userData.role) {
          userData.rol = 'CLIENT';
          userData.role = 'CLIENT';
        }
        
        setUser(userData);
      } catch (error) {
        console.error('AuthProvider: Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    } else if (storedUser && !hasAccessToken) {
      // User data exists but no token, clear stored data
      console.log('AuthProvider: Clearing stale user data (no token)');
      localStorage.removeItem('user');
    }

    setIsLoading(false);
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
    
    // Asegurar que el usuario tenga rol CLIENT si no tiene rol definido
    const userWithAuth = { 
      ...userData, 
      isAuthenticated: true,
      rol: userData.rol || 'CLIENT',
      role: userData.role || userData.rol || 'CLIENT'
    };
    
    console.log('AuthProvider: Setting user with role:', userWithAuth.rol);
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
    const hasClientRole = user?.rol === 'CLIENT' || user?.role === 'CLIENT';
    console.log('AuthProvider: isClient check:', { 
      userRol: user?.rol, 
      userRole: user?.role, 
      hasClientRole 
    });
    return hasClientRole;
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
    userRol: user?.rol,
    userRole: user?.role,
    isClientResult: isClient(),
  });

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
