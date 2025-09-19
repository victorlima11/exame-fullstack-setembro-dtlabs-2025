import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus, RefreshCw } from "lucide-react";
import { NotificationRule, Device } from "../../pages/notificationsPage/NotificationsPage";
import { NotificationRuleItem } from "./NotificationRuleItem";

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

interface NotificationRuleListProps {
  rules: NotificationRule[];
  devices: Device[];
  fetchRules: () => void;
  setShowRuleForm: (show: boolean) => void;
  startEditingRule: (rule: NotificationRule) => void;
  deleteRule: (ruleId: string) => void;
  editingRuleId: string | null;
  editFormData: EditFormData;
  setEditFormData: (data: EditFormData) => void;
  saveEditing: (ruleId: string) => void;
  cancelEditing: () => void;
  metrics: Metric[];
  operators: Operator[];
}

export function NotificationRuleList({ 
  rules, 
  devices,
  fetchRules, 
  setShowRuleForm, 
  startEditingRule, 
  deleteRule,
  editingRuleId,
  editFormData,
  setEditFormData,
  saveEditing,
  cancelEditing,
  metrics,
  operators
}: NotificationRuleListProps) {
  const getDeviceName = (sn: string) => {
    const device = devices.find(d => d.sn === sn);
    return device ? device.name : sn;
  };

  return (
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
            {rules.map((rule) => (
              <NotificationRuleItem 
                key={rule.id}
                rule={rule}
                devices={devices}
                getDeviceName={getDeviceName}
                startEditingRule={startEditingRule}
                deleteRule={deleteRule}
                isEditing={editingRuleId === rule.id}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                saveEditing={saveEditing}
                cancelEditing={cancelEditing}
                metrics={metrics}
                operators={operators}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
