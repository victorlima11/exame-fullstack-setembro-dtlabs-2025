import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Thermometer,
  AlertTriangle,
  RefreshCw,
  Edit,
  Save,
  X,
  Bell
} from "lucide-react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { API_URL_BASE } from "@/api/api";

interface NotificationRule {
  id: string;
  device_sn: string;
  condition: {
    metric: string;
    operator: string;
    value: number;
  };
  created_at?: string;
}

interface Device {
  id: string;
  name: string;
  location: string;
  sn: string;
  description?: string;
}

interface NotificationRulesProps {
  devices: Device[];
  onRuleAdded: () => void;
  onRuleDeleted: () => void;
  onRuleUpdated: () => void;
  maxRulesToShow?: number;
}

export function NotificationRules({ 
  devices, 
  onRuleAdded, 
  onRuleDeleted, 
  onRuleUpdated, 
  maxRulesToShow = 2
}: NotificationRulesProps) {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    device_sn: '',
    metric: 'cpu_usage',
    operator: '>',
    value: ''
  });
  const [editFormData, setEditFormData] = useState<{
    device_sn: string;
    metric: string;
    operator: string;
    value: string;
  } | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { authFetch, loading, error, clearError } = useAuthFetch();
  const API_BASE_URL = API_URL_BASE || 'http://localhost:3000/api/v1';

  const metrics = [
    { value: 'cpu_usage', label: 'CPU Usage (%)', icon: Cpu },
    { value: 'ram_usage', label: 'Memory Usage (%)', icon: HardDrive },
    { value: 'temperature', label: 'Temperature (°C)', icon: Thermometer },
    { value: 'disk_free', label: 'Free Disk Space (%)', icon: HardDrive },
    { value: 'latency', label: 'Latency (ms)', icon: Monitor },
  ];

  const operators = [
    { value: '>', label: 'Greater than (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '>=', label: 'Greater than or equal (>=)' },
    { value: '<=', label: 'Less than or equal (<=)' },
    { value: '==', label: 'Equal (==)' },
  ];

  const fetchRules = async () => {
    try {
      clearError();
      const data = await authFetch<NotificationRule[]>(`${API_BASE_URL}/notifications/rules`);
      setRules(data);
    } catch (error: any) {
      console.error('Error fetching rules:', error);
      toast({
        title: "Error",
        description: error.message || "Could not load notification rules.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.device_sn || !formData.metric || !formData.operator || !formData.value) {
      toast({
        title: "Required fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      clearError();
      const newRule = {
        device_sn: formData.device_sn,
        condition: {
          metric: formData.metric,
          operator: formData.operator,
          value: parseFloat(formData.value)
        }
      };

      await authFetch(`${API_BASE_URL}/notifications/rules`, {
        method: 'POST',
        body: JSON.stringify(newRule),
      });

      setFormData({ device_sn: '', metric: 'cpu_usage', operator: '>', value: '' });
      setShowForm(false);
      
      toast({
        title: "Rule created!",
        description: "New notification rule added successfully.",
      });

      onRuleAdded();
      fetchRules();

    } catch (error: any) {
      toast({
        title: "Error creating rule",
        description: error.message || "Could not create notification rule.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (rule: NotificationRule) => {
    setEditingId(rule.id);
    setEditFormData({
      device_sn: rule.device_sn,
      metric: rule.condition.metric,
      operator: rule.condition.operator,
      value: rule.condition.value.toString()
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData(null);
  };

  const saveEditing = async (ruleId: string) => {
    if (!editFormData) return;
    
    try {
      clearError();
      const updatedRule = {
        device_sn: editFormData.device_sn,
        condition: {
          metric: editFormData.metric,
          operator: editFormData.operator,
          value: parseFloat(editFormData.value)
        }
      };

      await authFetch(`${API_BASE_URL}/notifications/rules/${ruleId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedRule),
      });

      setEditingId(null);
      setEditFormData(null);
      
      toast({
        title: "Rule updated!",
        description: "Notification rule updated successfully.",
      });

      onRuleUpdated();
      fetchRules();

    } catch (error: any) {
      toast({
        title: "Error updating rule",
        description: error.message || "Could not update notification rule.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      setDeletingId(ruleId);
      clearError();
      await authFetch(`${API_BASE_URL}/notifications/rules/${ruleId}`, {
        method: 'DELETE',
      });

      setRules((prev) => prev.filter((r) => r.id !== ruleId));

      toast({
        title: "Rule removed",
        description: "Notification rule removed successfully.",
      });

      onRuleDeleted();
    } catch (error: any) {
      toast({
        title: "Error deleting rule",
        description: error.message || "Could not delete notification rule.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getMetricIcon = (metric: string) => {
    const metricInfo = metrics.find(m => m.value === metric);
    if (!metricInfo) return Monitor;
    return metricInfo.icon;
  };

  const getMetricLabel = (metric: string) => {
    const metricInfo = metrics.find(m => m.value === metric);
    return metricInfo?.label || metric;
  };

  const getDeviceName = (sn: string) => {
    const device = devices.find(d => d.sn === sn);
    return device ? device.name : sn;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const displayedRules = rules.slice(0, maxRulesToShow);
  const hasMoreRules = rules.length > maxRulesToShow;

  if (loading && rules.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Notification Rules</h3>
          <RefreshCw className="h-4 w-4 animate-spin" />
        </div>
        <div className="space-y-3">
          {[...Array(Math.min(2, maxRulesToShow))].map((_, i) => (
            <div key={i} className="p-4 border border-border/50 rounded-lg bg-card/30 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Notification Rules</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchRules}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {displayedRules.length > 0 ? (
        <div className="space-y-3">
          {displayedRules.map((rule) => {
            const Icon = getMetricIcon(rule.condition.metric);
            const isEditing = editingId === rule.id;
            
            return (
              <div 
                key={rule.id}
                className="p-4 border border-border/50 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
              >
                {isEditing ? (
                  // Edit form
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-device">Device</Label>
                        <Select 
                          value={editFormData?.device_sn || ''} 
                          onValueChange={(value) => setEditFormData({...editFormData!, device_sn: value})}
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
                        <Label htmlFor="edit-metric">Metric</Label>
                        <Select 
                          value={editFormData?.metric || ''} 
                          onValueChange={(value) => setEditFormData({...editFormData!, metric: value})}
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

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-operator">Operator</Label>
                        <Select 
                          value={editFormData?.operator || ''} 
                          onValueChange={(value) => setEditFormData({...editFormData!, operator: value})}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an operator" />
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
                        <Label htmlFor="edit-value">Value</Label>
                        <Input
                          id="edit-value"
                          type="number"
                          placeholder="Ex: 80"
                          value={editFormData?.value || ''}
                          onChange={(e) => setEditFormData({...editFormData!, value: e.target.value})}
                          step="0.1"
                          required
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => saveEditing(rule.id)}
                        disabled={!editFormData?.device_sn || !editFormData?.metric || !editFormData?.operator || !editFormData?.value}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelEditing}
                      >
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
                        <p className="font-medium text-sm text-foreground">
                          {getDeviceName(rule.device_sn)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getMetricLabel(rule.condition.metric)} {rule.condition.operator} {rule.condition.value}
                        </p>
                        {rule.created_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Created at: {formatDate(rule.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-warning/10 text-warning border-warning">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(rule)}
                        disabled={deletingId === rule.id}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                        disabled={deletingId === rule.id}
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
          
          {hasMoreRules && (
            <div className="pt-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleViewAllNotifications}
              >
                <Bell className="h-4 w-4 mr-2" />
                View all rules ({rules.length - displayedRules.length} more)
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No notification rules configured</p>
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} className="p-4 border border-border/50 rounded-lg bg-card/30 space-y-4">
          <h4 className="font-medium text-sm text-foreground">New Notification Rule</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
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
              <Label htmlFor="metric">Metric</Label>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="operator">Operator</Label>
              <Select 
                value={formData.operator} 
                onValueChange={(value) => setFormData({...formData, operator: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an operator" />
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
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
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
            <Button 
              type="submit" 
              size="sm" 
              className="bg-gradient-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Rule"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowForm(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button 
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full border-dashed border-border/50 hover:bg-card/50"
          disabled={devices.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          {devices.length === 0 ? "Add devices first" : "Add New Rule"}
        </Button>
      )}
    </div>
  );
}