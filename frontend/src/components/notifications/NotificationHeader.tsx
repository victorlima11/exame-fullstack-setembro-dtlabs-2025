import { Bell, AlertTriangle } from "lucide-react";

interface NotificationHeaderProps {
  activeTab: 'logs' | 'rules';
  onTabChange: (tab: 'logs' | 'rules') => void;
}

export function NotificationHeader({ activeTab, onTabChange }: NotificationHeaderProps) {
  return (
    <>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Notification Center
        </h2>
        <p className="text-muted-foreground">Manage notification logs and alert rules</p>
      </div>

      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'logs' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => onTabChange('logs')}
        >
          <Bell className="h-4 w-4 mr-2 inline" /> Notification Logs
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'rules' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => onTabChange('rules')}
        >
          <AlertTriangle className="h-4 w-4 mr-2 inline" /> Notification Rules
        </button>
      </div>
    </>
  );
}
