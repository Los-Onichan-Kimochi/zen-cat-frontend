import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="p-4">Bienvenido a la página principal de ZenCat Admin!</div>
}
