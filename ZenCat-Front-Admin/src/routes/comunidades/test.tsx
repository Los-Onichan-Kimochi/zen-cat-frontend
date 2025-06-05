import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/comunidades/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/comunidades/test"!</div>
}
