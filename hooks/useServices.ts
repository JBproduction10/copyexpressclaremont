/* eslint-disable react-hooks/exhaustive-deps */
// hooks/useServices.ts - Updated with real-time events
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { realtimeEvents } from '@/lib/realtime-events';

interface UseServicesOptions {
  activeOnly?: boolean;
  autoFetch?: boolean;
  realtimeUpdates?: boolean; // Enable real-time updates
}

export const useServices = (options: UseServicesOptions = {}) => {
  const { 
    activeOnly = false, 
    autoFetch = true,
    realtimeUpdates = true 
  } = options;
  
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const url = activeOnly ? '/api/services?active=true' : '/api/services';
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch services');
      
      const data = await response.json();
      setServices(data.services);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchServices();
    }
  }, [activeOnly]);

  // Listen for real-time updates
  useEffect(() => {
    if (!realtimeUpdates) return;

    const unsubscribe = realtimeEvents.on('services:update', () => {
      console.log('[Services] Real-time update detected, refetching...');
      fetchServices();
    });

    return () => unsubscribe();
  }, [realtimeUpdates, activeOnly]);

  const createService = async (service: any) => {
    const response = await fetch('/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(service)
    });

    if (!response.ok) throw new Error('Failed to create service');
    
    const data = await response.json();
    
    // Emit real-time event
    realtimeEvents.emit('services:update', { action: 'create', id: data.service.id });
    
    await fetchServices();
    return data.service;
  };

  const updateService = async (id: string, updates: any) => {
    // Optimistic update
    setServices(prevServices => 
      prevServices.map(s => s.id === id ? { ...s, ...updates } : s)
    );

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update service');
      
      // Emit real-time event
      realtimeEvents.emit('services:update', { action: 'update', id });
      
      await fetchServices();
    } catch (error) {
      // Rollback on error
      await fetchServices();
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    // Optimistic update
    setServices(prevServices => prevServices.filter(s => s.id !== id));

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete service');
      
      // Emit real-time event
      realtimeEvents.emit('services:update', { action: 'delete', id });
      
      await fetchServices();
    } catch (error) {
      // Rollback on error
      await fetchServices();
      throw error;
    }
  };

  const reorderServices = async (serviceIds: string[]) => {
    // Optimistic update
    const reordered = serviceIds.map(id => 
      services.find(s => s.id === id)!
    ).filter(Boolean);
    setServices(reordered);

    try {
      const response = await fetch('/api/services/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ serviceIds })
      });

      if (!response.ok) throw new Error('Failed to reorder services');
      
      // Emit real-time event
      realtimeEvents.emit('services:update', { action: 'reorder' });
      
      await fetchServices();
    } catch (error) {
      // Rollback on error
      await fetchServices();
      throw error;
    }
  };

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    reorderServices,
    refetch: fetchServices
  };
};