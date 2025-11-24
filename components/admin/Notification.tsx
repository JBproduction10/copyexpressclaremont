//components/admin
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const Notification: React.FC<NotificationProps> = ({ show, message, type }) => {
  if (!show) return null;

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
      <Alert className={bgColors[type]}>
        <AlertDescription className={textColors[type]}>
          {message}
        </AlertDescription>
      </Alert>
    </div>
  );
};