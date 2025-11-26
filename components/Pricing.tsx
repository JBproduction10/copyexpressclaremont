/* eslint-disable react-hooks/exhaustive-deps */
// components/Pricing.tsx - Updated with real-time updates
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { PricingTable } from "./PricingTable";
import { useState, useEffect } from "react";
import { Category } from "@/types";
import { realtimeEvents } from '@/lib/realtime-events';

const Pricing = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchAllCategories = async () => {
        try {
            const wasLoading = loading;
            if (!wasLoading) setIsRefreshing(true);
            
            setLoading(true);
            const response = await fetch('/api/categories?limit=1000');
            
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            
            const data = await response.json();
            setCategories(data.categories);
            setError(null);
            setLastUpdate(Date.now());
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load pricing data');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllCategories();

        // Listen for real-time updates
        const unsubscribe = realtimeEvents.on('categories:update', () => {
            console.log('[Pricing Component] Detected update, refetching...');
            fetchAllCategories();
        });

        return () => unsubscribe();
    }, []);

    if (loading && categories.length === 0) {
        return (
            <section id="prices" className="py-20 bg-background">
                <div className="container mx-auto px-6">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading pricing data...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="prices" className="py-20 bg-background">
                <div className="container mx-auto px-6">
                    <div className="text-center text-red-500">
                        <p>{error}</p>
                        <button 
                            onClick={fetchAllCategories}
                            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0) {
        return (
            <section id="prices" className="py-20 bg-background">
                <div className="container mx-auto px-6">
                    <div className="text-center text-gray-600">
                        <p>No pricing data available yet.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="prices" className="py-20 bg-background">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        <span className="text-primary">Pricing</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choose the package that fits your needs. All packages include our quality guarantee.
                    </p>
                </div>

                {/* Show loading indicator during refresh */}
                {isRefreshing && (
                    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 flex items-center gap-2 z-50 animate-fade-in">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm text-gray-600">Updating prices...</span>
                    </div>
                )}

                <div className="w-full max-w-7xl mx-auto" key={lastUpdate}>
                    <Tabs defaultValue={categories[0]?.id} className="w-full">
                        <div className="relative mb-6">
                            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
                                <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 h-auto p-1 bg-muted">
                                    {categories.map((category) => (
                                        <TabsTrigger
                                            key={category.id}
                                            value={category.id}
                                            className="text-xs sm:text-sm whitespace-nowrap px-3 py-2 data-[state=active]:bg-background"
                                        >
                                            {category.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                        </div>
                        
                        {categories.map((category) => (
                            <TabsContent key={category.id} value={category.id} className="mt-0">
                                <Card className="mb-6">
                                    <CardHeader className="space-y-2 pb-4">
                                        <CardTitle className="text-xl sm:text-2xl">{category.name}</CardTitle>
                                        <CardDescription className="text-sm sm:text-base">{category.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <Tabs defaultValue={category.subcategories[0]?.id} className="w-full">
                                            <div className="relative mb-6">
                                                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
                                                    <TabsList 
                                                        className={`inline-flex w-auto min-w-full gap-1 h-auto p-1 bg-muted
                                                            ${category.subcategories.length <= 2 ? 'sm:grid sm:w-full sm:grid-cols-2' : ''}
                                                            ${category.subcategories.length === 3 ? 'sm:grid sm:w-full sm:grid-cols-3' : ''}
                                                            ${category.subcategories.length === 4 ? 'sm:grid sm:w-full sm:grid-cols-2 lg:grid-cols-4' : ''}
                                                            ${category.subcategories.length >= 5 ? 'sm:grid sm:w-full sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}
                                                        `}
                                                    >
                                                        {category.subcategories.map((sub) => (
                                                            <TabsTrigger
                                                                key={sub.id}
                                                                value={sub.id}
                                                                className="text-xs sm:text-sm whitespace-nowrap px-3 py-2 data-[state=active]:bg-background"
                                                            >
                                                                {sub.name}
                                                            </TabsTrigger>
                                                        ))}
                                                    </TabsList>
                                                </div>
                                            </div>

                                            {category.subcategories.map((sub) => (
                                                <TabsContent key={sub.id} value={sub.id} className="mt-0">
                                                    <Card>
                                                        <CardHeader className="space-y-2 pb-4">
                                                            <CardTitle className="text-lg sm:text-xl">{sub.name}</CardTitle>
                                                            {sub.description && (
                                                                <CardDescription className="text-sm">{sub.description}</CardDescription>
                                                            )}
                                                        </CardHeader>
                                                        <CardContent className="pt-0">
                                                            <PricingTable subcategory={sub}/>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>
                                            ))}
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                    <div className="mt-6 p-3 sm:p-4 bg-primary/10 rounded-lg">
                        <p className="text-xs sm:text-sm text-foreground">
                            <strong>Note:</strong> Prices are in South African Rand (R). Volume discounts automatically apply based on quantity ordered.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;