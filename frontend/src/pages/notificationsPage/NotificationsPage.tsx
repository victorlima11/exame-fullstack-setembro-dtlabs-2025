import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { Header } from "@/components/header/Header";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";
import { RefreshCw, Cpu, HardDrive, Thermometer, Monitor } from "lucide-react";
import { NotificationHeader } from "@/components/notifications/NotificationHeader";
import { NotificationLogList } from "@/components/notifications/NotificationLogList";
import { NotificationRuleList } from "@/components/notifications/NotificationRuleList";
import { NotificationRuleForm } from "@/components/notifications/NotificationRuleForm";
import { API_URL_BASE, SOCKET_URL } from "@/api/api";

export interface NotificationLog {
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

export interface NotificationRule {
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

export interface Device {
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

export default function NotificationsPage() {
  const { user } = useAuth();
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'logs' | 'rules'>('logs');
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [realTimeNotifications, setRealTimeNotifications] = useState<NotificationLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<NotificationLog[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  const [formData, setFormData] = useState({
    device_sn: '',
    metric: 'cpu_usage',
    operator: '>',
    value: '',
    is_active: true
  });

  const [editFormData, setEditFormData] = useState({
    device_sn: '',
    metric: 'cpu_usage',
    operator: '>',
    value: '',
    is_active: true
  });

  const metrics = [
    { value: 'cpu_usage', label: 'CPU Usage (%)', icon: Cpu },
    { value: 'ram_usage', label: 'Memory Usage (%)', icon: HardDrive },
    { value: 'temperature', label: 'Temperature (°C)', icon: Thermometer },
    { value: 'disk_free', label: 'Disk Free (%)', icon: HardDrive },
    { value: 'latency', label: 'Latency (ms)', icon: Monitor },
  ];

  const operators = [
    { value: '>', label: 'Greater than (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '>=', label: 'Greater or equal (>=)' },
    { value: '<=', label: 'Less or equal (<=)' },
    { value: '==', label: 'Equal (==)' },
  ];
  
  const fetchNotificationLogs = useCallback(async () => {
    try {
      const logs = await authFetch(`${API_URL_BASE}/notifications`);
      setNotificationLogs(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }, [authFetch]);

  const fetchRules = useCallback(async () => {
    try {
      const rulesData = await authFetch(`${API_URL_BASE}/notifications/rules`);
      setRules(rulesData);
    } catch (error) {
      console.error('Error fetching rules:', error);
      throw error;
    }
  }, [authFetch]);

  const fetchDevices = useCallback(async () => {
    try {
      const devicesData = await authFetch(`${API_URL_BASE}/devices/user`);
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
        fetchDevices()
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

    const socket = io(`${SOCKET_URL}`, {
      transports: ['websocket'],
      auth: { token },
    });
    
    socketRef.current = socket;

    socket.emit('join-user-room', userId);

    socket.on('notification', (data: NotificationLog) => {
      const newNotification: NotificationLog = {
        id: `realtime-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: data.type || 'warning',
        title: data.title || `${data.condition?.metric ? `${data.condition.metric} alert` : 'Alert'}`,
        message: data.message || 'New notification received',
        device_sn: data.device_sn || 'Unknown Device',
        device_name: data.device_name,
        created_at: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
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

  const filterLogs = useCallback(() => {
    const allNotifications = [...realTimeNotifications, ...notificationLogs];
    
    let filtered = allNotifications;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.message?.toLowerCase().includes(term) ||
        log.device_name?.toLowerCase().includes(term) ||
        log.device_sn?.toLowerCase().includes(term) ||
        log.title?.toLowerCase().includes(term)
      );
    }

    setFilteredLogs(filtered);
  }, [notificationLogs, realTimeNotifications, searchTerm]);

  useEffect(() => {
    filterLogs();
  }, [filterLogs]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.device_sn || !formData.value) {
      toast({ title: "Required fields", description: "Please fill all fields.", variant: "destructive" });
      return;
    }

    try {
      const newRule = {
        device_sn: formData.device_sn,
        condition: { metric: formData.metric, operator: formData.operator, value: parseFloat(formData.value) },
        is_active: formData.is_active
      };

      await authFetch(`${API_URL_BASE}/notifications/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      });

      setFormData({ device_sn: '', metric: 'cpu_usage', operator: '>', value: '', is_active: true });
      setShowRuleForm(false);
      toast({ title: "Rule created!", description: "New notification rule added successfully." });
      fetchRules();
    } catch (error) {
      const err = error as Error;
      console.error('Error creating rule:', err);
      toast({ title: "Error creating rule", description: err.message || "Could not create rule.", variant: "destructive" });
    }
  };

  const startEditingRule = (rule: NotificationRule) => {
    setEditingRuleId(rule.id);
    setEditFormData({
      device_sn: rule.device_sn,
      metric: rule.condition.metric,
      operator: rule.condition.operator,
      value: rule.condition.value.toString(),
      is_active: rule.is_active
    });
  };

  const cancelEditing = () => {
    setEditingRuleId(null);
    setEditFormData({ device_sn: '', metric: 'cpu_usage', operator: '>', value: '', is_active: true });
  };

  const saveEditing = async (ruleId: string) => {
    try {
      const updatedRule = {
        device_sn: editFormData.device_sn,
        condition: { metric: editFormData.metric, operator: editFormData.operator, value: parseFloat(editFormData.value) },
        is_active: editFormData.is_active
      };

      await authFetch(`${API_URL_BASE}/notifications/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRule),
      });

      setEditingRuleId(null);
      toast({ title: "Rule updated!", description: "Notification rule updated successfully." });
      fetchRules();
    } catch (error) {
      const err = error as Error;
      console.error('Error updating rule:', err);
      toast({ title: "Error updating rule", description: err.message || "Could not update rule.", variant: "destructive" });
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await authFetch(`${API_URL_BASE}/notifications/rules/${ruleId}`, { method: 'DELETE' });
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      toast({ title: "Rule removed", description: "Notification rule removed successfully." });
    } catch (error) {
      const err = error as Error;
      console.error('Error deleting rule:', err);
      toast({ title: "Error deleting rule", description: err.message || "Could not delete rule.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentPage="Notifications" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="Notifications" />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <NotificationHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'logs' ? (
          <NotificationLogList 
            filteredLogs={filteredLogs}
            realTimeNotifications={realTimeNotifications}
            fetchNotificationLogs={fetchNotificationLogs}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        ) : (
          <div className="space-y-6">
            <NotificationRuleList 
              rules={rules}
              devices={devices}
              fetchRules={fetchRules}
              setShowRuleForm={setShowRuleForm}
              startEditingRule={startEditingRule}
              deleteRule={deleteRule}
              editingRuleId={editingRuleId}
              editFormData={editFormData}
              setEditFormData={setEditFormData}
              saveEditing={saveEditing}
              cancelEditing={cancelEditing}
              metrics={metrics}
              operators={operators}
            />
            {showRuleForm && (
              <NotificationRuleForm 
                formData={formData}
                setFormData={setFormData}
                handleCreateRule={handleCreateRule}
                setShowRuleForm={setShowRuleForm}
                devices={devices}
                metrics={metrics}
                operators={operators}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}