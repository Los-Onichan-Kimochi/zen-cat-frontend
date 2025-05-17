import {useNavigate, createFileRoute } from '@tanstack/react-router';
import {LoginForm} from '@/components/custom/auth/login-form'

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});


export function LoginComponent() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate({ to: '/' });
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <LoginForm onLoginSuccess={handleLoginSuccess}/>
    </div>
  );
}