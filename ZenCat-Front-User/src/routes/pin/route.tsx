import { createFileRoute } from '@tanstack/react-router';
import PINCard from '@/components/custom/PINCard';

export const Route = createFileRoute('/pin')({
  component: PinComponent,
});

function PinComponent() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <PINCard onComplete={(pin) => console.log('PIN correcto:', pin)} />
    </div>
  );
}