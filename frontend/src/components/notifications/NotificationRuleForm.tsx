import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Device } from "../../pages/notificationsPage/NotificationsPage";
import { Save, X } from "lucide-react";

interface FormData {
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

interface NotificationRuleFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleCreateRule: (e: React.FormEvent) => void;
  setShowRuleForm: (show: boolean) => void;
  devices: Device[];
  metrics: Metric[];
  operators: Operator[];
}

export function NotificationRuleForm({ 
  formData, 
  setFormData, 
  handleCreateRule, 
  setShowRuleForm, 
  devices, 
  metrics, 
  operators 
}: NotificationRuleFormProps) {
  return (
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
  );
}
