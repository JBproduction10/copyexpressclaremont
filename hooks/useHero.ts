// hooks/useHero.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

export const useHero = (token: string | null) => {
  const [hero, setHero] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHero = async (activeOnly = false) => {
    try {
      setLoading(true);
      const url = activeOnly ? '/api/hero?active=true' : '/api/hero';
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch hero content');
      
      const data = await response.json();
      setHero(data.hero);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  const updateHero = async (updates: any) => {
    const response = await fetch('/api/hero', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update hero content');
    
    await fetchHero();
  };

  return {
    hero,
    loading,
    error,
    updateHero,
    refetch: fetchHero
  };
};