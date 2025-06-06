import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sesiones/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sesiones/"!</div>
}
