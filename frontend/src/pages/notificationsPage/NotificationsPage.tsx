import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { Header } from "@/components/header/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Plus,
  RefreshCw,
  Edit,
  Save,
  X,
  Search,
  Cpu,
  HardDrive,
  Thermometer,
  Monitor,
  BellRing
} from "lucide-react";

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

export default function NotificationsPage() {
  const { user } = useAuth();
  const { authFetch, loading: fetchLoading } = useAuthFetch();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'logs' | 'rules'>('logs');
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [realTimeNotifications, setRealTimeNotifications] = useState<NotificationLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<NotificationLog[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
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
  
  useEffect(() => {
    loadData();
    setupWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    filterLogs();
  }, [notificationLogs, realTimeNotifications, searchTerm, typeFilter]);

  const setupWebSocket = () => {
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
  };

  const loadData = async () => {
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
  };

  const fetchNotificationLogs = async () => {
    try {
      const logs = await authFetch('http://localhost:3000/api/v1/notifications');
      setNotificationLogs(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  };

  const fetchRules = async () => {
    try {
      const rulesData = await authFetch('http://localhost:3000/api/v1/notifications/rules');
      setRules(rulesData);
    } catch (error) {
      console.error('Error fetching rules:', error);
      throw error;
    }
  };

  const fetchDevices = async () => {
    try {
      const devicesData = await authFetch('http://localhost:3000/api/v1/devices/user');
      setDevices(devicesData);
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  };

  const filterLogs = () => {
    // Combine saved logs with real-time notifications
    const allNotifications = [...realTimeNotifications, ...notificationLogs];
    
    let filtered = allNotifications;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === typeFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(term) ||
        log.device_name?.toLowerCase().includes(term) ||
        log.device_sn.toLowerCase().includes(term) ||
        log.title.toLowerCase().includes(term)
      );
    }

    setFilteredLogs(filtered);
  };

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

      await authFetch('http://localhost:3000/api/v1/notifications/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      });

      setFormData({ device_sn: '', metric: 'cpu_usage', operator: '>', value: '', is_active: true });
      setShowRuleForm(false);
      toast({ title: "Rule created!", description: "New notification rule added successfully." });
      fetchRules();
    } catch (error: any) {
      console.error('Error creating rule:', error);
      toast({ title: "Error creating rule", description: error.message || "Could not create rule.", variant: "destructive" });
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

      await authFetch(`http://localhost:3000/api/v1/notifications/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRule),
      });

      setEditingRuleId(null);
      toast({ title: "Rule updated!", description: "Notification rule updated successfully." });
      fetchRules();
    } catch (error: any) {
      console.error('Error updating rule:', error);
      toast({ title: "Error updating rule", description: error.message || "Could not update rule.", variant: "destructive" });
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await authFetch(`http://localhost:3000/api/v1/notifications/rules/${ruleId}`, { method: 'DELETE' });
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      toast({ title: "Rule removed", description: "Notification rule removed successfully." });
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      toast({ title: "Error deleting rule", description: error.message || "Could not delete rule.", variant: "destructive" });
    }
  };

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

  const getMetricIcon = (metric: string) => {
    const metricInfo = metrics.find(m => m.value === metric);
    return metricInfo?.icon || Monitor;
  };

  const getMetricLabel = (metric: string) => {
    const metricInfo = metrics.find(m => m.value === metric);
    return metricInfo?.label || metric;
  };

  const getDeviceName = (sn: string) => {
    const device = devices.find(d => d.sn === sn);
    return device ? device.name : sn;
  };

  const isRealTimeNotification = (id: string) => {
    return id.startsWith('realtime-');
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
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Notification Center
          </h2>
          <p className="text-muted-foreground">Manage notification logs and alert rules</p>
        </div>

        <div className="flex border-b border-border">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'logs' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('logs')}
          >
            <Bell className="h-4 w-4 mr-2 inline" /> Notification Logs
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'rules' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('rules')}
          >
            <AlertTriangle className="h-4 w-4 mr-2 inline" /> Notification Rules
          </button>
        </div>

        {activeTab === 'logs' ? (
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
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="warning">Warnings</SelectItem>
                    <SelectItem value="error">Errors</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No notifications found</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3 pr-4">
                    {filteredLogs.map((log) => {
                      const badgeClass = getNotificationBadge(log.type);
                      const isRealTime = isRealTimeNotification(log.id);
                      
                      return (
                        <div 
                          key={log.id} 
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
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Notifications Rules</CardTitle>
                    <CardDescription>
                      Set up rules to receive automatic alerts
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchRules}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      onClick={() => setShowRuleForm(true)}
                      className="bg-gradient-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Rule
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {rules.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No notification rules configured</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rules.map((rule) => {
                      const Icon = getMetricIcon(rule.condition.metric);
                      const isEditing = editingRuleId === rule.id;
                      
                      return (
                        <div key={rule.id} className="p-4 border border-border/50 rounded-lg bg-card/30">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Dispositivo</Label>
                                  <Select 
                                    value={editFormData.device_sn} 
                                    onValueChange={(value) => setEditFormData({...editFormData, device_sn: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a device" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {devices.map((device) => (
                                        <SelectItem key={device.sn} value={device.sn}>
                                          {device.name} ({device.sn})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>Metric</Label>
                                  <Select 
                                    value={editFormData.metric} 
                                    onValueChange={(value) => setEditFormData({...editFormData, metric: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a metric" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {metrics.map((metric) => (
                                        <SelectItem key={metric.value} value={metric.value}>
                                          {metric.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Operator</Label>
                                  <Select 
                                    value={editFormData.operator} 
                                    onValueChange={(value) => setEditFormData({...editFormData, operator: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a operator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {operators.map((operator) => (
                                        <SelectItem key={operator.value} value={operator.value}>
                                          {operator.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>Value</Label>
                                  <Input
                                    type="number"
                                    placeholder="Ex: 80"
                                    value={editFormData.value}
                                    onChange={(e) => setEditFormData({...editFormData, value: e.target.value})}
                                    step="0.1"
                                    min="0"
                                  />
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => saveEditing(rule.id)}
                                  disabled={!editFormData.device_sn || !editFormData.value}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button variant="outline" onClick={cancelEditing}>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                                  <Icon className="h-4 w-4 text-warning" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {getDeviceName(rule.device_sn)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {getMetricLabel(rule.condition.metric)} {rule.condition.operator} {rule.condition.value}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Criada em: {new Date(rule.created_at).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditingRule(rule)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteRule(rule.id)}
                                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            {showRuleForm && (
              <Card>
                <CardHeader>
                  <CardTitle>New Rule Notification</CardTitle>
                  <CardDescription>
                    Set up a new rule to receive automatic alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateRule} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Device</Label>
                        <Select 
                          value={formData.device_sn} 
                          onValueChange={(value) => setFormData({...formData, device_sn: value})}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a device" />
                          </SelectTrigger>
                          <SelectContent>
                            {devices.map((device) => (
                              <SelectItem key={device.sn} value={device.sn}>
                                {device.name} ({device.sn})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Metric</Label>
                        <Select 
                          value={formData.metric} 
                          onValueChange={(value) => setFormData({...formData, metric: value})}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a metric" />
                          </SelectTrigger>
                          <SelectContent>
                            {metrics.map((metric) => (
                              <SelectItem key={metric.value} value={metric.value}>
                                {metric.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Operator</Label>
                        <Select 
                          value={formData.operator} 
                          onValueChange={(value) => setFormData({...formData, operator: value})}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((operator) => (
                              <SelectItem key={operator.value} value={operator.value}>
                                {operator.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 80"
                          value={formData.value}
                          onChange={(e) => setFormData({...formData, value: e.target.value})}
                          step="0.1"
                          required
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Create Rule
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowRuleForm(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}