'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface HeroData {
  title: string;
  highlightedText: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonAction: string;
  secondaryButtonText: string;
  secondaryButtonAction: string;
  backgroundImage: string;
  isActive: boolean;
}

const Hero = () => {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const response = await fetch('/api/hero?active=true');
      if (!response.ok) throw new Error('Failed to fetch hero data');
      const data = await response.json();
      setHeroData(data.hero);
    } catch (error) {
      console.error('Error fetching hero data:', error);
      // Fallback to default values if fetch fails
      setHeroData({
        title: 'CopyExpress',
        highlightedText: 'Claremont',
        subtitle: 'Your One-Stop Print Shop for Everything from Lamination to Custom Apparel',
        primaryButtonText: 'Get a Quote',
        primaryButtonAction: 'contact',
        secondaryButtonText: 'Our Services',
        secondaryButtonAction: 'services',
        backgroundImage: '/copyexpresshero.jpeg',
        isActive: true
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </section>
    );
  }

  if (!heroData || !heroData.isActive) {
    return null;
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {heroData.backgroundImage && (
          <Image
            src={heroData.backgroundImage}
            alt="Professional printing services"
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-linear-to-br from-secondary/95 via-secondary/85 to-primary/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6">
            {heroData.title} <span className="text-primary">{heroData.highlightedText}</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            {heroData.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-glow text-primary-foreground shadow-glow transition-all duration-300 hover:scale-105"
              onClick={() => scrollToSection(heroData.primaryButtonAction)}
            >
              {heroData.primaryButtonText} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-secondary"
              onClick={() => scrollToSection(heroData.secondaryButtonAction)}
            >
              {heroData.secondaryButtonText}
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