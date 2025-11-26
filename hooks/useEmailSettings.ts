/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useEmailSettings.ts
import { useState, useEffect, useCallback } from 'react';

export interface EmailSettings {
  _id?: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  adminEmail: string;
  customerSubject: string;
  adminSubject: string;
  isActive: boolean;
  testMode: boolean;
}

export const useEmailSettings = () => {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email-settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch email settings');
      }
      
      const data = await response.json();
      setSettings(data.settings);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching email settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newSettings: Partial<EmailSettings>) => {
    try {
      const response = await fetch('/api/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      return { success: true };
    } catch (err: any) {
      console.error('Error saving email settings:', err);
      throw err;
    }
  };

  const sendTestEmail = async (testEmail: string) => {
    try {
      const response = await fetch('/api/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send test email');
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error sending test email:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    sendTestEmail,
    refetch: fetchSettings,
  };
};