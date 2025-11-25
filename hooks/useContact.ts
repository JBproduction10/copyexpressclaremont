// hooks/useContact.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

export const useContact = (token: string | null) => {
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContact = async (activeOnly = false) => {
    try {
      setLoading(true);
      const url = activeOnly ? '/api/contact-info?active=true' : '/api/contact-info';
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch contact content');
      
      const data = await response.json();
      setContact(data.contact);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const updateContact = async (updates: any) => {
    const response = await fetch('/api/contact-info', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update contact content');
    
    await fetchContact();
  };

  const addContactInfo = async (info: { icon: string; title: string; details: string }) => {
    const newInfo = {
      id: `info-${Date.now()}`,
      icon: info.icon,
      title: info.title,
      details: info.details,
      order: contact.contactInfo?.length || 0
    };

    const updatedInfo = [...(contact.contactInfo || []), newInfo];
    await updateContact({ contactInfo: updatedInfo });
  };

  const updateContactInfo = async (infoId: string, updates: { icon?: string; title?: string; details?: string }) => {
    const updatedInfo = contact.contactInfo.map((info: any) =>
      info.id === infoId ? { ...info, ...updates } : info
    );
    await updateContact({ contactInfo: updatedInfo });
  };

  const deleteContactInfo = async (infoId: string) => {
    const updatedInfo = contact.contactInfo.filter((info: any) => info.id !== infoId);
    await updateContact({ contactInfo: updatedInfo });
  };

  const reorderContactInfo = async (infoIds: string[]) => {
    const updatedInfo = infoIds.map((id, index) => {
      const info = contact.contactInfo.find((i: any) => i.id === id);
      return { ...info, order: index };
    });
    await updateContact({ contactInfo: updatedInfo });
  };

  return {
    contact,
    loading,
    error,
    updateContact,
    addContactInfo,
    updateContactInfo,
    deleteContactInfo,
    reorderContactInfo,
    refetch: fetchContact
  };
};