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

  return (
    <ProtectedRoute requiredRole={requiredRole}>
      {user && <MainLayout user={user}>{children}</MainLayout>}
    </ProtectedRoute>
  );
}
