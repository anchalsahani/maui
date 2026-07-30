import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/layout/HeroSection";
import Problem from "@/components/layout/Problem";
import FeatureShowcase from "@/components/layout/FeatureShowcase";
import TestimonialFaq from "@/components/layout/TestimonialFaq";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="landing-page relative min-h-screen overflow-hidden bg-[var(--color-bg)]">
      <Navbar />
      <HeroSection />
      <Problem />
      <FeatureShowcase />
      <TestimonialFaq />
      <Footer />
    </div>
  );
}
