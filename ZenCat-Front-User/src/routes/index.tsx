import { createFileRoute } from '@tanstack/react-router'
import { HomeComponent } from './home/route';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});
