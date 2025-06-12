import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/planes-membresia/ver')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/planes-membresia/ver"!</div>;
}
