import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { X, Check, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { AppContextType } from '../App';
import { toast } from 'sonner@2.0.3';

interface NotificationsProps {
  context: AppContextType;
}

export function Notifications({ context }: NotificationsProps) {
  const { notifications } = context;
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    // Тут буде логіка позначення як прочитане
    toast.success('Сповіщення прочитано');
  };

  const markAllAsRead = () => {
    // Тут буде логіка позначення всіх як прочитані
    toast.success('Всі сповіщення прочитано');
  };

  const deleteNotification = (notificationId: string) => {
    // Тут буде логіка видалення сповіщення
    toast.success('Сповіщення видалено');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год тому`;
    return date.toLocaleDateString('uk-UA');
  };

  // Компонент тепер не рендерить UI - тільки логіку сповіщень
  return null;
}