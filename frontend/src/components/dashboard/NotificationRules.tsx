import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  X
} from "lucide-react";

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
}

export function NotificationRules({ devices, onRuleAdded, onRuleDeleted, onRuleUpdated }: NotificationRulesProps) {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const API_BASE_URL = 'http://localhost:3000/api/v1';

  const metrics = [
    { value: 'cpu_usage', label: 'Uso de CPU (%)', icon: Cpu },
    { value: 'ram_usage', label: 'Uso de Memória (%)', icon: HardDrive },
    { value: 'temperature', label: 'Temperatura (°C)', icon: Thermometer },
    { value: 'disk_free', label: 'Espaço Livre em Disco (%)', icon: HardDrive },
    { value: 'latency', label: 'Latência (ms)', icon: Monitor },
  ];

  const operators = [
    { value: '>', label: 'Maior que (>)' },
    { value: '<', label: 'Menor que (<)' },
    { value: '>=', label: 'Maior ou igual (>=)' },
    { value: '<=', label: 'Menor ou igual (<=)' },
    { value: '==', label: 'Igual (==)' },
  ];

  // Função para fazer requisições autenticadas
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      // Se for 204, não há corpo para json
      let errorData: any = {};
      if (response.status !== 204) {
        errorData = await response.json().catch(() => ({}));
      }
      throw new Error((errorData && typeof errorData === 'object' && 'error' in errorData ? errorData.error : undefined) || `Erro ${response.status}: ${response.statusText}`);
    }

    // Se for 204, não retorna nada
    if (response.status === 204) return null;
    return response.json();
  };

  // Buscar regras do usuário
  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await authFetch('/notifications/rules');
      setRules(data);
    } catch (error: any) {
      console.error('Erro ao buscar regras:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar as regras de notificação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar nova regra
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.device_sn || !formData.metric || !formData.operator || !formData.value) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newRule = {
        device_sn: formData.device_sn,
        condition: {
          metric: formData.metric,
          operator: formData.operator,
          value: parseFloat(formData.value)
        }
      };

      await authFetch('/notifications/rules', {
        method: 'POST',
        body: JSON.stringify(newRule),
      });

      setFormData({ device_sn: '', metric: 'cpu_usage', operator: '>', value: '' });
      setShowForm(false);
      
      toast({
        title: "Regra criada!",
        description: "Nova regra de notificação adicionada com sucesso.",
      });

      onRuleAdded(); // Notificar o componente pai
      fetchRules(); // Recarregar a lista

    } catch (error: any) {
      toast({
        title: "Erro ao criar regra",
        description: error.message || "Não foi possível criar a regra de notificação.",
        variant: "destructive",
      });
    }
  };

  // Iniciar edição de regra
  const startEditing = (rule: NotificationRule) => {
    setEditingId(rule.id);
    setEditFormData({
      device_sn: rule.device_sn,
      metric: rule.condition.metric,
      operator: rule.condition.operator,
      value: rule.condition.value.toString()
    });
  };

  // Cancelar edição
  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData(null);
  };

  // Salvar edição
  const saveEditing = async (ruleId: string) => {
    if (!editFormData) return;
    
    try {
      const updatedRule = {
        device_sn: editFormData.device_sn,
        condition: {
          metric: editFormData.metric,
          operator: editFormData.operator,
          value: parseFloat(editFormData.value)
        }
      };

      await authFetch(`/notifications/rules/${ruleId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedRule),
      });

      setEditingId(null);
      setEditFormData(null);
      
      toast({
        title: "Regra atualizada!",
        description: "A regra de notificação foi atualizada com sucesso.",
      });

      onRuleUpdated(); // Notificar o componente pai
      fetchRules(); // Recarregar a lista

    } catch (error: any) {
      toast({
        title: "Erro ao atualizar regra",
        description: error.message || "Não foi possível atualizar a regra de notificação.",
        variant: "destructive",
      });
    }
  };

  // Excluir regra
  const handleDelete = async (ruleId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
    try {
      setDeletingId(ruleId);
      await authFetch(`/notifications/rules/${ruleId}`, {
        method: 'DELETE',
      });

      // Atualiza a lista localmente para resposta mais rápida
      setRules((prev) => prev.filter((r) => r.id !== ruleId));

      toast({
        title: "Regra removida",
        description: "A regra de notificação foi removida com sucesso.",
      });

      onRuleDeleted(); // Notificar o componente pai
      // fetchRules(); // Não precisa recarregar, já atualizou localmente
    } catch (error: any) {
      toast({
        title: "Erro ao excluir regra",
        description: error.message || "Não foi possível excluir a regra de notificação.",
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
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Carregar regras ao inicializar
  useEffect(() => {
    fetchRules();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Regras de Notificação</h3>
          <RefreshCw className="h-4 w-4 animate-spin" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
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
        <h3 className="text-lg font-semibold">Regras de Notificação</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchRules}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Existing Rules */}
      {rules.length > 0 ? (
        <div className="space-y-3">
          {rules.map((rule) => {
            const Icon = getMetricIcon(rule.condition.metric);
            const isEditing = editingId === rule.id;
            
            return (
              <div 
                key={rule.id}
                className="p-4 border border-border/50 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
              >
                {isEditing ? (
                  // Formulário de edição
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-device">Dispositivo</Label>
                        <Select 
                          value={editFormData?.device_sn || ''} 
                          onValueChange={(value) => setEditFormData({...editFormData!, device_sn: value})}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um dispositivo" />
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
                        <Label htmlFor="edit-metric">Métrica</Label>
                        <Select 
                          value={editFormData?.metric || ''} 
                          onValueChange={(value) => setEditFormData({...editFormData!, metric: value})}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma métrica" />
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
                        <Label htmlFor="edit-operator">Operador</Label>
                        <Select 
                          value={editFormData?.operator || ''} 
                          onValueChange={(value) => setEditFormData({...editFormData!, operator: value})}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um operador" />
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
                        <Label htmlFor="edit-value">Valor</Label>
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
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Visualização da regra
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
                            Criada em: {formatDate(rule.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-warning/10 text-warning border-warning">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Ativo
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
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">Nenhuma regra de notificação configurada</p>
        </div>
      )}

      {/* Add Rule Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="p-4 border border-border/50 rounded-lg bg-card/30 space-y-4">
          <h4 className="font-medium text-sm text-foreground">Nova Regra de Notificação</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="device">Dispositivo</Label>
              <Select 
                value={formData.device_sn} 
                onValueChange={(value) => setFormData({...formData, device_sn: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um dispositivo" />
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
              <Label htmlFor="metric">Métrica</Label>
              <Select 
                value={formData.metric} 
                onValueChange={(value) => setFormData({...formData, metric: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma métrica" />
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
              <Label htmlFor="operator">Operador</Label>
              <Select 
                value={formData.operator} 
                onValueChange={(value) => setFormData({...formData, operator: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um operador" />
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
              <Label htmlFor="value">Valor</Label>
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
              {loading ? "Criando..." : "Criar Regra"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowForm(false)}
              disabled={loading}
            >
              Cancelar
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
          {devices.length === 0 ? "Adicione dispositivos primeiro" : "Adicionar Nova Regra"}
        </Button>
      )}
    </div>
  );
}