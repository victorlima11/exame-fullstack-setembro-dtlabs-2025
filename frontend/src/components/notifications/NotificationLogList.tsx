import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, RefreshCw, Search } from "lucide-react";
import { NotificationLog } from "../../pages/notificationsPage/NotificationsPage";
import { NotificationLogItem } from "./NotificationLogItem";

interface NotificationLogListProps {
  filteredLogs: NotificationLog[];
  realTimeNotifications: NotificationLog[];
  fetchNotificationLogs: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function NotificationLogList({ 
  filteredLogs, 
  realTimeNotifications, 
  fetchNotificationLogs, 
  searchTerm, 
  setSearchTerm 
}: NotificationLogListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Notification History</CardTitle>
            <CardDescription>
              {filteredLogs.length} notification{filteredLogs.length !== 1 ? 's' : ''} found
              {realTimeNotifications.length > 0 && (
                <span className="ml-2 text-primary">
                  ({realTimeNotifications.length} new)
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchNotificationLogs}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No notifications found</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {filteredLogs.map((log) => (
                <NotificationLogItem key={log.id} log={log} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
