import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sesiones/editar')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/sesiones/editar"!</div>;
}
