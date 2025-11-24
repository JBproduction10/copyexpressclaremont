/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

export const useAbout = (token: string | null) => {
  const [about, setAbout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAbout = async (activeOnly = false) => {
    try {
      setLoading(true);
      const url = activeOnly ? '/api/about?active=true' : '/api/about';
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch about content');
      
      const data = await response.json();
      setAbout(data.about);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const updateAbout = async (updates: any) => {
    const response = await fetch('/api/about', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update about content');
    
    await fetchAbout();
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