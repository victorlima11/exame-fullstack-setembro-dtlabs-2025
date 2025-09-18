import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";

// It would be better to have these in a central types file.
interface NotificationLog {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  device_sn: string;
  device_name?: string;
  created_at: string;
  read: boolean;
  condition?: {
    metric: string;
    operator: string;
    value: number;
  };
}

interface NotificationRule {
  id: string;
  device_sn: string;
  device_name?: string;
  condition: {
    metric: string;
    operator: string;
    value: number;
  };
  created_at: string;
  is_active: boolean;
}

interface Device {
  id: string;
  name: string;
  sn: string;
  location: string;
}

function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload.userId || payload.sub || null;
  } catch {
    return null;
  }
}

export function useNotificationsPage() {
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'logs' | 'rules'>('logs');
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [realTimeNotifications, setRealTimeNotifications] = useState<NotificationLog[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);

  const fetchNotificationLogs = useCallback(async () => {
    try {
      const logs = await authFetch('http://localhost:3000/api/v1/notifications');
      setNotificationLogs(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }, [authFetch]);

  const fetchRules = useCallback(async () => {
    try {
      const rulesData = await authFetch('http://localhost:3000/api/v1/notifications/rules');
      setRules(rulesData);
    } catch (error) {
      console.error('Error fetching rules:', error);
      throw error;
    }
  }, [authFetch]);

  const fetchDevices = useCallback(async () => {
    try {
      const devicesData = await authFetch('http://localhost:3000/api/v1/devices/user');
      setDevices(devicesData);
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  }, [authFetch]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchNotificationLogs(),
        fetchRules(),
        fetchDevices(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Could not load data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchNotificationLogs, fetchRules, fetchDevices, toast]);

  const setupWebSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);
    
    if (!userId) return;

    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
      auth: { token },
    });
    
    socketRef.current = socket;

    socket.emit('join-user-room', userId);

    socket.on('notification', (data: any) => {
      const newNotification: NotificationLog = {
        id: `realtime-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: data.type || 'warning',
        title: data.title || `${data.metric ? `${data.metric} alert` : 'Alert'}`,
        message: data.message || 'New notification received',
        device_sn: data.device_sn || 'Unknown Device',
        device_name: data.device_name,
        created_at: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
        read: false,
        condition: data.condition
      };

      setRealTimeNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: newNotification.title,
        description: newNotification.message,
        variant: newNotification.type === 'error' ? 'destructive' : 'default',
      });
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }, [toast]);

  useEffect(() => {
    loadData();
    setupWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [loadData, setupWebSocket]);

  const handleSaveRule = useCallback(async (formData: any, editingRule: NotificationRule | null) => {
    const isEditing = !!editingRule;
    const url = isEditing
      ? `http://localhost:3000/api/v1/notifications/rules/${editingRule!.id}`
      : 'http://localhost:3000/api/v1/notifications/rules';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const ruleData = {
        device_sn: formData.device_sn,
        condition: { metric: formData.metric, operator: formData.operator, value: parseFloat(formData.value) },
        is_active: formData.is_active
      };

      await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData),
      });

      toast({ title: `Rule ${isEditing ? 'updated' : 'created'}!`, description: `Notification rule ${isEditing ? 'updated' : 'added'} successfully.` });
      fetchRules();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} rule:`, error);
      toast({ title: `Error ${isEditing ? 'updating' : 'creating'} rule`, description: error.message || `Could not ${isEditing ? 'update' : 'create'} rule.`, variant: "destructive" });
    }
  }, [authFetch, fetchRules, toast]);

  const handleDeleteRule = useCallback(async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await authFetch(`http://localhost:3000/api/v1/notifications/rules/${ruleId}`, { method: 'DELETE' });
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      toast({ title: "Rule removed", description: "Notification rule removed successfully." });
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      toast({ title: "Error deleting rule", description: error.message || "Could not delete rule.", variant: "destructive" });
    }
  }, [authFetch, toast]);

  const onRefreshLogs = useCallback(async () => {
    setLoading(true);
    try {
      await fetchNotificationLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not refresh notification logs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchNotificationLogs, toast]);

  const onRefreshRules = useCallback(async () => {
    setLoading(true);
    try {
      await fetchRules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not refresh notification rules.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchRules, toast]);

  return {
    loading,
    activeTab,
    setActiveTab,
    notificationLogs,
    realTimeNotifications,
    rules,
    devices,
    fetchNotificationLogs: onRefreshLogs,
    fetchRules: onRefreshRules,
    handleSaveRule,
    handleDeleteRule,
  };
}