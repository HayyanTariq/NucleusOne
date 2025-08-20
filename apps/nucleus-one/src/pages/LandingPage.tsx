import Hero from '@/components/landing/Hero';
import AppShowcase from '@/components/landing/AppShowcase';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <AppShowcase />
    </div>
  );
};

export default LandingPage;