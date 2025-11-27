// components/About.tsx - With enhanced debugging
'use client';

import { CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Feature {
  id: string;
  text: string;
  order: number;
}

interface AboutData {
  title: string;
  subtitle: string;
  highlightedText: string;
  mainDescription: string;
  features: Feature[];
  statisticNumber: string;
  statisticLabel: string;
  statisticSubtext: string;
  isActive: boolean;
}

const About = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateCount, setUpdateCount] = useState(0);

  const fetchAbout = async () => {
    try {
      console.log('[About Component] Fetching about data...');
      
      const timestamp = Date.now();
      const response = await fetch(`/api/about?active=true&t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch about data');
      }
      
      const data = await response.json();
      console.log('[About Component] Received data:', data.about);
      
      setAboutData(data.about);
      setUpdateCount(prev => prev + 1);
      
    } catch (error) {
      console.error('[About Component] Error fetching about:', error);
      toast.error('Failed to load about section');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[About Component] Component mounted');
    fetchAbout();

    // Listen for updates from admin panel
    const handleUpdate = (event: Event) => {
      console.log('[About Component] ✅ Received aboutUpdated event!', event);
      toast.info('Updating About section...');
      fetchAbout();
    };

    // Listen to window event
    window.addEventListener('aboutUpdated', handleUpdate);
    console.log('[About Component] Event listener registered');
    
    // Also listen to storage events (for cross-tab updates)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'aboutUpdated') {
        console.log('[About Component] Storage event detected');
        fetchAbout();
      }
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      console.log('[About Component] Cleaning up event listeners');
      window.removeEventListener('aboutUpdated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (loading) {
    return (
      <section id="about" className="py-20 bg-muted" aria-label="About section loading">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
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
      data-update-count={updateCount}
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
              {aboutData.features?.map((feature) => (
                <li key={feature.id} className="flex items-center gap-3 animate-fade-in">
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
      
      {/* Debug info - remove in production
      <div className="fixed bottom-2 left-2 bg-black/80 text-white text-xs p-2 rounded">
        Updates: {updateCount}
      </div> */}
    </section>
  );
};

export default About;