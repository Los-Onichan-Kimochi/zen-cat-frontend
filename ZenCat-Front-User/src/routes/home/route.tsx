import { createFileRoute } from '@tanstack/react-router';
import Presentacion from '../../components/custom/presentacion';

export const Route = createFileRoute('/home')({
  component: HomeComponent,
});

export function HomeComponent() {
  return (
    <div>
      <h1>¡Bienvenido a la Página de Inicio!</h1>
      <Presentacion />
      <p>Este es el contenido principal de tu página de inicio.</p>
      <button onClick={() => alert('¡Hiciste clic!')}>Haz clic aquí</button>
    </div>
  );
}