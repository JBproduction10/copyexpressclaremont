// components/Navbar.tsx - SEO Enhanced
'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasLogo, setHasLogo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if logo exists
  useEffect(() => {
    const checkLogo = async () => {
      try {
        const response = await fetch('/logo.png', { method: 'HEAD' });
        setHasLogo(response.ok);
      } catch {
        setHasLogo(false);
      }
    };
    checkLogo();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Home", id: "hero" },
    { label: "Services", id: "services" },
    { label: "Prices", id: "prices" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => scrollToSection("hero")}
            className="flex items-center gap-2"
            aria-label="Go to homepage"
          >
            {hasLogo ? (
              <div className="relative h-10 w-auto">
                <Image
                  src="/logo.png"
                  alt="CopyExpress Claremont Logo"
                  width={120}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <span className={`text-2xl font-bold ${isScrolled ? "text-foreground" : "text-primary-foreground"}`}>
                Copy<span className="text-primary">Express</span>
              </span>
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`transition-colors hover:text-primary ${
                  isScrolled ? "text-foreground" : "text-primary-foreground"
                }`}
                aria-label={`Navigate to ${link.label}`}
              >
                {link.label}
              </button>
            ))}
            <Button 
              onClick={() => scrollToSection("contact")}
              className="bg-primary hover:bg-primary-glow"
              aria-label="Get a quote"
            >
              Get Quote
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden ${isScrolled ? "text-foreground" : "text-primary-foreground"}`}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-left py-2 text-foreground hover:text-primary-foreground transition-colors"
                  aria-label={`Navigate to ${link.label}`}
                >
                  {link.label}
                </button>
              ))}
              <Button 
                onClick={() => scrollToSection("contact")}
                className="bg-primary hover:bg-primary-glow w-full"
                aria-label="Get a quote"
              >
                Get Quote
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;