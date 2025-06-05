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
      <div id="top" className="scroll-mt-16">
        <Hero />
      </div>
      <div id="comunidades" className="scroll-mt-16">
        <ExploraSpan />
      </div>
      <CardGrid />

      <BottomSpan />
      <ActivitiesSection />
      <VirtualServicesSection />
      <div id="como-funciona" className="scroll-mt-16">
        <HowItWorks />
      </div>
      <div id="membresia" className="scroll-mt-16">
        <PlansSection />
      </div>
      <BenefitSection />
      <CallToActionSection />
    </>
  );
}