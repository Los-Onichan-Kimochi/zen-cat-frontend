import { createFileRoute } from '@tanstack/react-router'
import {ForgotForm} from '@/components/custom/forgot-form';


export const Route = createFileRoute('/forgot')({
  component: ForgotComponent,
})

function ForgotComponent() {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ForgotForm/>
      </div>
    );
}
