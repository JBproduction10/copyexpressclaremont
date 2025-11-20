'use client';

import { CheckCircle } from "lucide-react";

const features = [
  "Fast turnaround times",
  "Competitive pricing",
  "Professional quality",
  "Expert customer service",
  "Latest printing technology",
  "Custom solutions"
];

const About = () => {
  return (
    <section id="about" className="py-20 bg-muted">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose <span className="text-primary">CopyExpress Claremont?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              With years of experience in the printing industry, CopyExpress Claremont has become 
              the trusted choice for businesses and individuals throughout the community. We combine 
              cutting-edge technology with personalized service to deliver exceptional results every time.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="aspect-square bg-linear-to-br from-primary to-accent rounded-2xl p-8 flex items-center justify-center">
              <div className="text-center text-primary-foreground">
                <div className="text-6xl font-bold mb-4">35+</div>
                <div className="text-2xl mb-2">Years</div>
                <div className="text-lg opacity-90">Of Excellence</div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary rounded-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
