import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/layout/HeroSection";
import Problem from "@/components/layout/Problem";
import Solution from "@/components/layout/Solution";  
import TestimonialFaq from "@/components/layout/TestimonialFaq";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)]">
      <Navbar />
      <HeroSection />
      <Problem />
      <Solution />
      <TestimonialFaq />
      <Footer />
    </div>
  );
}
