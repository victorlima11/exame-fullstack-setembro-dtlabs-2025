import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotificationRule, Device } from "../../pages/notificationsPage/NotificationsPage";
import { Cpu, HardDrive, Thermometer, Monitor, Edit, Save, Trash2, X } from "lucide-react";

interface EditFormData {
  device_sn: string;
  metric: string;
  operator: string;
  value: string;
  is_active: boolean;
}

interface Metric {
  value: string;
  label: string;
}

interface Operator {
  value: string;
  label: string;
}

interface NotificationRuleItemProps {
  rule: NotificationRule;
  devices: Device[];
  getDeviceName: (sn: string) => string;
  startEditingRule: (rule: NotificationRule) => void;
  deleteRule: (ruleId: string) => void;
  isEditing: boolean;
  editFormData: EditFormData;
  setEditFormData: (data: EditFormData) => void;
  saveEditing: (ruleId: string) => void;
  cancelEditing: () => void;
  metrics: Metric[];
  operators: Operator[];
}

const getMetricIcon = (metric: string) => {
  const metrics = [
    { value: 'cpu_usage', icon: Cpu },
    { value: 'ram_usage', icon: HardDrive },
    { value: 'temperature', icon: Thermometer },
    { value: 'disk_free', icon: HardDrive },
    { value: 'latency', icon: Monitor },
  ];
  const metricInfo = metrics.find(m => m.value === metric);
  return metricInfo?.icon || Monitor;
};

const getMetricLabel = (metric: string) => {
  const metrics = [
    { value: 'cpu_usage', label: 'CPU Usage (%)' },
    { value: 'ram_usage', label: 'Memory Usage (%)' },
    { value: 'temperature', label: 'Temperature (°C)' },
    { value: 'disk_free', label: 'Disk Free (%)' },
    { value: 'latency', label: 'Latency (ms)' },
  ];
  const metricInfo = metrics.find(m => m.value === metric);
  return metricInfo?.label || metric;
};

export function NotificationRuleItem({ 
  rule, 
  devices,
  getDeviceName, 
  startEditingRule, 
  deleteRule, 
  isEditing, 
  editFormData, 
  setEditFormData, 
  saveEditing, 
  cancelEditing,
  metrics,
  operators
}: NotificationRuleItemProps) {
  const Icon = getMetricIcon(rule.condition.metric);

  return (
    <div className="p-4 border border-border/50 rounded-lg bg-card/30">
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
}
