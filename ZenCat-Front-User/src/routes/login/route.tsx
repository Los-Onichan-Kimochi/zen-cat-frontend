import { createFileRoute } from '@tanstack/react-router';
import MainLayout from '../../layouts/MainLayout';

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});

export function LoginComponent() {
  return (
      <div>
      <h1>Login Usuario</h1>
    </div>
  );
}