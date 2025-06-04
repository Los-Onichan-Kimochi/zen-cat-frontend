import {createFileRoute } from '@tanstack/react-router';
import {SignupForm} from '@/components/custom/signup-form';

export const Route = createFileRoute('/signup')({
  component: SignupComponent,
});

function SignupComponent() {
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignupForm/>
    </div>
  );
} 