import { createFileRoute } from '@tanstack/react-router'
import '@/styles/custom/welcome.css';
import { useUserContext } from '@/context/UserContext';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useUserContext(); 
  const welcomeMessage = user?.name ? `Bienvenido, ${user.name}!` : 'Bienvenido!, hackerman';
  return (
    <div className="p-4 h-full flex flex-col items-center justify-center">
      <h1 className="animate-welcome text-6xl md:text-8xl font-bold text-gray-700 tracking-tight text-center">
        {welcomeMessage}
      </h1>
    </div>
  )
}
