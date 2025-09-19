import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Trash2
} from "lucide-react";

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  deviceName: string;
  timestamp: string;
  read: boolean;
}

import { API_URL_BASE, SOCKET_URL } from "@/api/api";

function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload.userId || payload.sub || null;
  } catch {
    return null;
  }
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'info':
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getNotificationBadge = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return { variant: 'secondary' as const, class: 'bg-warning/10 text-warning border-warning' };
      case 'error':
        return { variant: 'destructive' as const, class: '' };
      case 'success':
        return { variant: 'default' as const, class: 'bg-success text-success-foreground' };
      case 'info':
        return { variant: 'default' as const, class: '' };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);
    if (!userId) return;

    const socket = io(`${SOCKET_URL}`, {
      transports: ['websocket'],
      auth: { token },
    });
    socketRef.current = socket;

    socket.emit('join-user-room', userId);

    socket.on('notification', (data: any) => {
      const notif: Notification = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        type: 'warning',
        title: data.metric ? `${data.metric} alert` : 'Alert',
        message: data.message || 'New notification',
        deviceName: data.device_sn || 'Device',
        timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [notif, ...prev].slice(0, 20));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BellRing className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Recent Notifications
          </span>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        {notifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotifications([])}
            className="text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            Clear all
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No notifications at the moment</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {notifications.map((notification) => {
              const badgeInfo = getNotificationBadge(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-3 border border-border/50 rounded-lg transition-all duration-200 ${
                    notification.read 
                      ? 'bg-card/30 opacity-70' 
                      : 'bg-card/50 hover:bg-card/70 border-primary/20'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {notification.title}
                          </h4>
                          <Badge className={`text-xs ${badgeInfo.class}`}>
                            {notification.type === 'warning' && 'Warning'}
                            {notification.type === 'error' && 'Error'}
                            {notification.type === 'success' && 'Success'}
                            {notification.type === 'info' && 'Info'}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span className="font-medium">{notification.deviceName}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(notification.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="ml-2 p-1 h-6 w-6 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}