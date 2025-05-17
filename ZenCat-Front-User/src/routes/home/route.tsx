import { createFileRoute } from '@tanstack/react-router';
import { Hero } from '../../components/ui/Home/SliderTop';
import { ExploraSpan } from '../../components/ui/Home/ExploraSpan';
import CardGrid from '../../components/ui/Home/CardGrid';
import { BottomSpan } from '../../components/ui/Home/BottomSpan';
import VirtualServicesSection from '../../components/ui/Home/VirtualServicesSection';
import ActivitiesSection from '../../components/ui/Home/ActivitiesSection';
import HowItWorks from '../../components/ui/Home/HowItWorks';
import PlansSection from '../../components/ui/Home/PlanSection';
import BenefitSection from '../../components/ui/Home/BenefitSection';
import CallToActionSection from '@/components/ui/Home/CallToActionSection';
export const Route = createFileRoute('/home')({
  component: HomeComponent,
});

export function HomeComponent() {
  return (
    <>
      <Hero />
      <ExploraSpan />
      <CardGrid />
      <BottomSpan />
      <ActivitiesSection />
      <VirtualServicesSection />
      <HowItWorks />
      <PlansSection />
      <BenefitSection />
      <CallToActionSection />
    </>
  );
}