import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/NotFoundPage')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/NotFoundPage"!</div>;
}
