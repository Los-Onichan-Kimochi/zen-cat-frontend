import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/comunidades/nuevo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/comunidades/nuevo"!</div>
}
