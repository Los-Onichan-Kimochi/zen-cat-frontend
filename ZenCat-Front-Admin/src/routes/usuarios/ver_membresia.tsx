import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/usuarios/ver_membresia')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/usuarios/ver_membresia"!</div>
}
