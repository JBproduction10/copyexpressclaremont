/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Contact.tsx - Fixed version
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapPin, Phone, Mail, Clock, Globe, Building, User, Calendar, MessageCircle } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Icon mapping
const iconMap: { [key: string]: any } = {
  MapPin,
  Phone,
  Mail,
  Clock,
  FaWhatsapp,
  Globe,
  Building,
  User,
  Calendar,
  MessageCircle
};

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactData, setContactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: ''
  });

  // Fetch contact data from API
  const fetchContactData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contact-info?active=true', {
        cache: 'no-store', // CRITICAL: Prevent caching
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch contact data');
      
      const data = await response.json();
      console.log('[Contact] Fetched data:', data.contact);
      setContactData(data.contact);
    } catch (error) {
      console.error('Error fetching contact data:', error);
      toast.error('Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactData();

    // Listen for updates from admin panel
    const handleUpdate = () => {
      console.log('[Contact] Received update event, refetching...');
      fetchContactData();
    };

    window.addEventListener('contactUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('contactUpdated', handleUpdate);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Quote Request Received! We'll get back to you shortly.");
        setFormData({ name: '', email: '', service: '', message: '' });
      } else {
        toast.error(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section id="contact" className="py-20 bg-background" aria-label="Contact section loading">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contact information...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!contactData) return null;

  // Sort contact info by order
  const sortedContactInfo = [...(contactData.contactInfo || [])].sort((a, b) => a.order - b.order);

  return (
    <section 
      id="contact" 
      className="py-20 bg-background"
      aria-labelledby="contact-heading"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 id="contact-heading" className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {contactData.title.split(' ').slice(0, -2).join(' ')}{' '}
            <span className="text-primary">{contactData.title.split(' ').slice(-2).join(' ')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {contactData.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>Fill out the form and we&apos;ll respond within 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  placeholder="Service Needed (e.g., T-shirt printing)"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Textarea
                  placeholder="Tell us about your project..."
                  className="min-h-32"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-glow"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Request Quote'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>{contactData.subtitle}</CardTitle>
              <CardDescription>Find us through your preferred channel</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={sortedContactInfo[0]?.id} className="w-full">
                <TabsList className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-6 h-auto w-full">
                  {sortedContactInfo.map((info) => {
                    const Icon = iconMap[info.icon] || MapPin;
                    return (
                      <TabsTrigger
                        key={info.id}
                        value={info.id}
                        className="flex items-center justify-center gap-1 px-2 py-2"
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{info.title}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {sortedContactInfo.map((info) => {
                  const Icon = iconMap[info.icon] || MapPin;
                  return (
                    <TabsContent key={info.id} value={info.id} className="mt-0">
                      <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 min-h-[200px]">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-3">
                          {info.title}
                        </h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          {info.details}
                        </p>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;