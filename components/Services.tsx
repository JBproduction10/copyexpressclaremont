//components
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Shield, Shirt, Coffee, Sticker, FileText, Scissors, Sparkles } from "lucide-react";

const services = [
    {
        icon: Printer,
        title: "Digital Printing",
        description: "High-quality digital printing for all your document needs, fro business cards to posters."
    },
    {
        icon: Shield,
        title: "Lamination",
        description: "Professional lamination services to protect and preserve your important documents."
    },
    {
        icon: Shirt,
        title: "Apparel Printing",
        description: "Custom t-shirt printing, hoodies, and more with vibrant, long-lasting designs."
    },
    {
        icon: Coffee,
        title: "Utensils Printing",
        description: 'Personalized utensils(mugs, coasters, plates, etc...) perfect for gitfs, promotions, or special occasions.'
    },
    {
        icon: Sticker,
        title: "Custom Stickers",
        description: 'Eye-catching stickers in any shape, size, or design for branding or fun.'
    },
    {
        icon: FileText,
        title: "Large Format",
        description: "Banners, posters, and signange in any size for events and displays."
    },
    {
        icon: Scissors,
        title: "Die Cutting",
        description: "Precision cutting services for custom shapes and professional finishing."
    },
    {
        icon: Sparkles,
        title: "Special Finishes",
        description: "Premium finishes including binding, embossing, foiling, and spot UV coating."
    }
];

const Services = () => {
    return(
        <section id="services" className="py-20 bg-muted">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Our <span className="text-primary">Services</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        From simple copies to complex custom projects, we deliver quality printing solutions for every need.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => {
                        const Icon = service.icon;

                        return(
                            <Card
                                key={index}
                                className="hover-scale border-border hover:border-primary transition-all duration-300 hover:shadow-lg group"
                                style={{animationDelay: `${index * 100}ms`}}
                            >
                                <CardHeader>
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                                        <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                                    </div>
                                    <CardTitle className="text-xl">{service.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">{service.description}</CardDescription>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Services;