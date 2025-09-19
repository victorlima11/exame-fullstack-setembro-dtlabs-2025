import { Badge } from "@/components/ui/badge";
import { NotificationLog } from "../../pages/notificationsPage/NotificationsPage";
import { Bell, AlertTriangle, CheckCircle, XCircle, Clock, BellRing } from "lucide-react";

interface NotificationLogItemProps {
  log: NotificationLog;
}

const getNotificationIcon = (type: NotificationLog['type']) => {
  switch (type) {
    case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
    case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
    case 'info': return <Bell className="h-4 w-4 text-primary" />;
  }
};

const getNotificationBadge = (type: NotificationLog['type']) => {
  switch (type) {
    case 'warning': return 'bg-warning/10 text-warning border-warning';
    case 'error': return 'bg-destructive/10 text-destructive border-destructive';
    case 'success': return 'bg-success/10 text-success border-success';
    case 'info': return 'bg-primary/10 text-primary border-primary';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const isRealTimeNotification = (id: string) => {
  return id.startsWith('realtime-');
};

export function NotificationLogItem({ log }: NotificationLogItemProps) {
  const badgeClass = getNotificationBadge(log.type);
  const isRealTime = isRealTimeNotification(log.id);

  return (
    <div 
      className={`p-4 border border-border/50 rounded-lg ${log.read ? 'bg-muted/30 opacity-70' : 'bg-card hover:bg-card/70'} ${isRealTime ? 'border-primary/50 bg-primary/5' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-0.5">{getNotificationIcon(log.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-foreground">{log.title}</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={badgeClass}>
                  {log.type === 'warning' && 'Warning'}
                  {log.type === 'error' && 'Error'}
                  {log.type === 'success' && 'Success'}
                  {log.type === 'info' && 'Info'}
                </Badge>
                {isRealTime && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                    <BellRing className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{log.message}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{log.device_name || log.device_sn}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimestamp(log.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
