import { createFileRoute } from '@tanstack/react-router';
import { Hero } from '../../components/ui/Home/SliderTop';
import { ExploraSpan } from '../../components/ui/Home/ExploraSpan';
import CardGrid from '../../components/ui/Home/CardGrid';
import { BottomSpan } from '../../components/ui/Home/BottomSpan';

export const Route = createFileRoute('/home')({
  component: HomeComponent,
});

export function HomeComponent() {
  return (
    <div>
      <Hero />
      <ExploraSpan />
      <CardGrid />
      <BottomSpan />
    </div>
  );
}