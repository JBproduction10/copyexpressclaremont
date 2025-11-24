/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useServices.ts
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useServices = (activeOnly = false) => {
  const { data: session } = useSession();
  const [services, setServices] = useState([]);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const createService = async (service: any) => {
    if (!session) throw new Error('Not authenticated');

    const response = await fetch('/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(service)
    });

    if (!response.ok) throw new Error('Failed to create service');
    
    const data = await response.json();
    await fetchServices();
    return data.service;
  };

  const updateService = async (id: string, updates: any) => {
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update service');
    
    await fetchServices();
  };

  const deleteService = async (id: string) => {
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`/api/services/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete service');
    
    await fetchServices();
  };

  const reorderServices = async (serviceIds: string[]) => {
    if (!session) throw new Error('Not authenticated');

    const response = await fetch('/api/services/reorder', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ serviceIds })
    });

    if (!response.ok) throw new Error('Failed to reorder services');
    
    await fetchServices();
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