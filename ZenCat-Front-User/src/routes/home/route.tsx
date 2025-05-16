import { createFileRoute } from '@tanstack/react-router';
import Presentacion from '../../components/custom/presentacion';

export const Route = createFileRoute('/home')({
  component: HomeComponent,
});

export function HomeComponent() {
  return (
    <div>
      <Presentacion />
      <p>Este es el contenido principal de tu página de inicio.</p>
      <button onClick={() => alert('¡Hiciste clic!')}>Haz clic aquí</button>
    </div>
  );
}