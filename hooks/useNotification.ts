//hooks
import { useState, useCallback } from 'react';

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const useNotification = () => {
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    type: 'success'
  });

  const showNotification = useCallback((message: string, type: Notification['type'] = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  return { notification, showNotification };
};