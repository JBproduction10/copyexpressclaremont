/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAbout.ts - Fixed version
import { useState, useEffect } from 'react';

export const useAbout = (token: string | null) => {
  const [about, setAbout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAbout = async (activeOnly = false) => {
    try {
      setLoading(true);
      const url = activeOnly ? '/api/about?active=true' : '/api/about';
      
      // CRITICAL: Disable caching
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch about content');
      
      const data = await response.json();
      console.log('[useAbout] Fetched about:', data.about);
      setAbout(data.about);
      setError(null);
    } catch (err: any) {
      console.error('[useAbout] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const updateAbout = async (updates: any) => {
    console.log('[useAbout] Updating about with:', updates);
    
    const response = await fetch('/api/about', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update about content');
    }
    
    console.log('[useAbout] Update successful, refetching...');
    await fetchAbout();
    
    return response.json();
  };

  const addFeature = async (feature: { text: string }) => {
    const newFeature = {
      id: `f-${Date.now()}`,
      text: feature.text,
      order: about.features?.length || 0
    };

    const updatedFeatures = [...(about.features || []), newFeature];
    await updateAbout({ features: updatedFeatures });
  };

  const updateFeature = async (featureId: string, text: string) => {
    const updatedFeatures = about.features.map((f: any) =>
      f.id === featureId ? { ...f, text } : f
    );
    await updateAbout({ features: updatedFeatures });
  };

  const deleteFeature = async (featureId: string) => {
    const updatedFeatures = about.features.filter((f: any) => f.id !== featureId);
    await updateAbout({ features: updatedFeatures });
  };

  const reorderFeatures = async (featureIds: string[]) => {
    const updatedFeatures = featureIds.map((id, index) => {
      const feature = about.features.find((f: any) => f.id === id);
      return { ...feature, order: index };
    });
    await updateAbout({ features: updatedFeatures });
  };

  return {
    about,
    loading,
    error,
    updateAbout,
    addFeature,
    updateFeature,
    deleteFeature,
    reorderFeatures,
    refetch: fetchAbout
  };
};