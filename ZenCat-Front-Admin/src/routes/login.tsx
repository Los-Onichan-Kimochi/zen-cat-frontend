import { useNavigate, createFileRoute } from '@tanstack/react-router';
import '@/styles/custom/login.css';
import { LoginForm } from '@/components/custom/auth/login-form';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

// TODO: Add a loading state and a error state and a success state
// TODO: Add a forgot password button
// TODO: Add a register button
// TODO: Add a remember me checkbox
// TODO: Add a forgot password modal
// TODO: Add a register modal 
// TODO: Add a social login buttons
// TODO: Add a remember me checkbox
// TODO: Add a forgot password modal
// TODO: Add a register modal

function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="flex min-h-screen">
      <div 
        className="hidden md:flex w-1/2 login-background bg-black items-center justify-center bg-cover bg-center animate-scroll-right"
      >
      </div>
      {/* Right: Login Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-200 bg-opacity-50 backdrop-blur-sm">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}

export default LoginPage;
