import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/planes-membresia/agregar')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/planes-membresia/agregar"!</div>;
}
