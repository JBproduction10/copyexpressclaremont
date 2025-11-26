// components/admin/EmailSettingsManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Settings as SettingsIcon, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { EmailSettings } from '@/hooks/useEmailSettings';

interface EmailSettingsManagerProps {
  settings: EmailSettings | null;
  loading: boolean;
  onSave: (settings: Partial<EmailSettings>) => Promise<{ success: boolean }>;
  onTestEmail: (email: string) => Promise<{ success: boolean }>;
}

export const EmailSettingsManager: React.FC<EmailSettingsManagerProps> = ({
  settings,
  loading,
  onSave,
  onTestEmail,
}) => {
  const [formData, setFormData] = useState<Partial<EmailSettings>>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'CopyExpress Claremont',
    replyToEmail: '',
    adminEmail: '',
    customerSubject: 'We received your quote request - CopyExpress Claremont',
    adminSubject: 'New Quote Request from {name}',
    testMode: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpSecure: settings.smtpSecure,
        smtpUser: settings.smtpUser,
        smtpPassword: '', // Don't populate password
        fromEmail: settings.fromEmail,
        fromName: settings.fromName,
        replyToEmail: settings.replyToEmail,
        adminEmail: settings.adminEmail,
        customerSubject: settings.customerSubject,
        adminSubject: settings.adminSubject,
        testMode: settings.testMode,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) return;
    
    setIsTesting(true);
    setTestSuccess(false);
    
    try {
      await onTestEmail(testEmail);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading email settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Configure SMTP settings and email addresses for the contact form
            </CardDescription>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Saved successfully!</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="smtp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="smtp">SMTP Settings</TabsTrigger>
            <TabsTrigger value="addresses">Email Addresses</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
          </TabsList>

          {/* SMTP Settings Tab */}
          <TabsContent value="smtp" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={formData.smtpHost}
                  onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
                <p className="text-xs text-gray-500">Gmail: smtp.gmail.com, Outlook: smtp-mail.outlook.com</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
                  placeholder="587"
                />
                <p className="text-xs text-gray-500">TLS: 587, SSL: 465</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="smtpSecure"
                checked={formData.smtpSecure}
                onCheckedChange={(checked) => setFormData({ ...formData, smtpSecure: checked })}
              />
              <Label htmlFor="smtpSecure">Use SSL/TLS (Port 465)</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input
                id="smtpUser"
                value={formData.smtpUser}
                onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                placeholder="your-email@gmail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password / App Password</Label>
              <div className="relative">
                <Input
                  id="smtpPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.smtpPassword}
                  onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                  placeholder="Enter password or leave empty to keep current"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-yellow-600">
                For Gmail: Use App Password, not your regular password. 
                <a 
                  href="https://support.google.com/accounts/answer/185833" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline ml-1"
                >
                  Learn more
                </a>
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t">
              <Switch
                id="testMode"
                checked={formData.testMode}
                onCheckedChange={(checked) => setFormData({ ...formData, testMode: checked })}
              />
              <Label htmlFor="testMode">Test Mode (Log emails without sending)</Label>
            </div>
          </TabsContent>

          {/* Email Addresses Tab */}
          <TabsContent value="addresses" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email Address</Label>
              <Input
                id="fromEmail"
                type="email"
                value={formData.fromEmail}
                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                placeholder="noreply@copyexpressclaremont.com"
              />
              <p className="text-xs text-gray-500">Email address that appears in the &apos;From&apos; field</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={formData.fromName}
                onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                placeholder="CopyExpress Claremont"
              />
              <p className="text-xs text-gray-500">Name that appears with the from email</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="replyToEmail">Reply-To Email</Label>
              <Input
                id="replyToEmail"
                type="email"
                value={formData.replyToEmail}
                onChange={(e) => setFormData({ ...formData, replyToEmail: e.target.value })}
                placeholder="info@copyexpressclaremont.com"
              />
              <p className="text-xs text-gray-500">Email where customer replies will go</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email (Receive Submissions)</Label>
              <Input
                id="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                placeholder="jbangala90@gmail.com"
              />
              <p className="text-xs text-gray-500">Email that receives contact form submissions</p>
            </div>
          </TabsContent>

          {/* Email Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminSubject">Admin Email Subject</Label>
              <Input
                id="adminSubject"
                value={formData.adminSubject}
                onChange={(e) => setFormData({ ...formData, adminSubject: e.target.value })}
                placeholder="New Quote Request from {name}"
              />
              <p className="text-xs text-gray-500">
                Use {'{name}'} to insert customer name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerSubject">Customer Confirmation Subject</Label>
              <Input
                id="customerSubject"
                value={formData.customerSubject}
                onChange={(e) => setFormData({ ...formData, customerSubject: e.target.value })}
                placeholder="We received your quote request"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 pt-6 border-t mt-6">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Email Settings'}
          </Button>

          {/* Test Email Section */}
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Label htmlFor="testEmail" className="text-sm font-semibold">
              Test Email Configuration
            </Label>
            <div className="flex gap-2">
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1"
              />
              <Button
                onClick={handleTest}
                disabled={isTesting || !testEmail}
                variant="outline"
              >
                <Send className="w-4 h-4 mr-2" />
                {isTesting ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
            {testSuccess && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Test email sent successfully!
              </p>
            )}
            <p className="text-xs text-gray-600">
              Send a test email to verify your SMTP configuration
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};