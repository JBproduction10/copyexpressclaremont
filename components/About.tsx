/* eslint-disable @typescript-eslint/no-explicit-any */
// components/About.tsx - SEO Enhanced
'use client';

import { CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

const About = () => {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const response = await fetch('/api/about?active=true');
      const data = await response.json();
      setAboutData(data.about);
    } catch (error) {
      console.error('Error fetching about:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="about" className="py-20 bg-muted" aria-label="About section loading">
        <div className="container mx-auto px-6">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  if (!aboutData || !aboutData.isActive) {
    return null;
  }

  return (
    <section 
      id="about" 
      className="py-20 bg-muted"
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <article className="animate-fade-in">
            <h2 id="about-heading" className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {aboutData.title} <span className="text-primary">{aboutData.highlightedText}</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {aboutData.mainDescription}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
              {aboutData.features?.map((feature: any) => (
                <li key={feature.id} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                  <span className="text-foreground">{feature.text}</span>
                </li>
              ))}
            </ul>
          </article>

          <div className="relative animate-fade-in" role="complementary" aria-label="Company statistics">
            <div className="aspect-square bg-primary rounded-2xl p-8 flex items-center justify-center">
              <div className="text-center text-primary-foreground">
                <div className="text-6xl font-bold mb-4" aria-label={`${aboutData.statisticNumber} ${aboutData.statisticLabel}`}>
                  {aboutData.statisticNumber}
                </div>
                <div className="text-2xl mb-2">{aboutData.statisticLabel}</div>
                <div className="text-lg opacity-90">{aboutData.statisticSubtext}</div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary rounded-2xl -z-10" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;