import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user' | 'guest';
}

export function AuthenticatedLayout({
  children,
  requiredRole,
}: AuthenticatedLayoutProps) {
  const { user } = useAuth();

  // Map frontend role types to backend role checking
  const requireAdmin = requiredRole === 'admin';
  const allowedRoles = requiredRole
    ? [
        requiredRole === 'admin'
          ? 'ADMINISTRATOR'
          : requiredRole === 'user'
            ? 'CLIENT'
            : 'GUEST',
      ]
    : [];

  return (
    <ProtectedRoute requireAdmin={requireAdmin} allowedRoles={allowedRoles}>
      {user && <MainLayout user={user}>{children}</MainLayout>}
    </ProtectedRoute>
  );
}
