'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBg from "@/assets/copyexpresshero.jpeg";
import Image from "next/image";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroBg} 
          alt="Professional printing services" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-secondary/95 via-secondary/85 to-primary/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6">
            CopyExpress <span className="text-primary">Claremont</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Your One-Stop Print Shop for Everything from Lamination to Custom Apparel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-glow text-primary-foreground shadow-(--shadow-glow) transition-all duration-300 hover:scale-105"
              onClick={() => scrollToSection("contact")}
            >
              Get a Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-secondary"
              onClick={() => scrollToSection("services")}
            >
              Our Services
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
