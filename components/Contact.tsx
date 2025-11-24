//components
'use client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {MapPin, Phone, Mail, Clock} from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { useState } from 'react';
import { toast } from 'sonner';

const contactInfo = [
    {
        id: 'location',
        icon: MapPin,
        title: 'Location',
        details: 'SHOP 7, INTABA BUILDING, VINEYARD ROAD, CLAREMONT'
    },
    {
        id: 'phone',
        icon: Phone,
        title: "Phone",
        details: "+27 (0) 21 140 3228"
    },
    {
        id: 'whatsapp',
        icon: FaWhatsapp,
        title: 'WhatsApp',
        details: '+27 66 292 4870'
    },
    {
        id: 'email',
        icon: Mail,
        title: 'Email',
        details: 'info@copyexpressclaremont.com'
    },
    {
        id: 'hours',
        icon: Clock,
        title: 'Hours',
        details: "Mon-Fri: 08:30AM-5:30PM"
    },
    {
        id: 'weekend',
        icon: Clock,
        title: 'Weekend',
        details: 'Sat: 09:00AM-2:00PM, Sun: 10:00AM-3:00PM'
    }
];

const Contact= () =>{
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        service: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try{
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if(response.ok){
                toast.success("Quote Request Received! We'll get back to you shortly.")
                setFormData({name:'', email:'', service:'', message:''});
            }else{
                toast.error
                (data.message || 'Failed to send message. Please try again.');
            }
        }catch(error){
            console.error('Error submitting form:', error);
            toast.error('An error occured. Please try again later.');
        }finally{
            setIsSubmitting(false);
        }
    }

    return(
        <section id="contact" className="py-20 bg-background">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Get a <span className="text-primary">Free Quote</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Ready to bring your printing project to life? Contact us today for a free, no-obligation quote.
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
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                    disabled={isSubmitting}
                                />
                                <Input 
                                    type="email" 
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                    disabled={isSubmitting}
                                />
                                <Input 
                                    placeholder="Service Needed (e.g., T-shirt printing)"
                                    value={formData.service}
                                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                                    required
                                    disabled={isSubmitting}
                                />
                                <Textarea 
                                    placeholder="Tell us about your project..."
                                    className="min-h-32"
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
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
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>Find us through your preferred channel</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="location" className="w-full">
                                <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-6 h-auto">
                                    <TabsTrigger value="location" className="flex items-center justify-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span className="text-xs sm:text-sm">Location</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="phone" className="flex items-center justify-center">
                                        <Phone className="w-4 h-4 mr-1" />
                                        <span className="text-xs sm:text-sm">Phone</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="whatsapp" className="flex items-center justify-center">
                                        <FaWhatsapp className="w-4 h-4 mr-1" />
                                        <span className="text-xs sm:text-sm">WhatsApp</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="hours" className="flex items-center justify-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span className="text-xs sm:text-sm">Hours</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="weekend" className="flex items-center justify-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span className="text-xs sm:text-sm">Weekend</span>
                                    </TabsTrigger>
                                </TabsList>
                                
                                {contactInfo.map((info) => {
                                    const Icon = info.icon;
                                    return (
                                        <TabsContent key={info.id} value={info.id} className="mt-0">
                                            <div className="flex flex-col items-center text-center p-8">
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
    )
}

export default Contact;