import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Services from "@/components/Services";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Hero/>
      <Services/>
      <Pricing/>
      <About/>
      <Contact/>
    </div>
  );
}
