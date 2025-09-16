import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Activity,
  RefreshCw,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Save,
  ArrowLeft
} from "lucide-react";
import { Header } from "../global/Header";

interface Device {
  id: string;
  name: string;
  location: string;
  sn: string;
  description?: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: string;
}

export default function DevicesPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    sn: "",
    description: ""
  });

  useEffect(() => {
    fetchUserDevices();
  }, []);

  useEffect(() => {
    filterDevices();
  }, [devices, searchTerm, statusFilter]);

  const fetchUserDevices = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/devices/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const devicesWithStatus = await Promise.all(
          data.map(async (device: any) => {
            let status: Device['status'] = 'offline';
            let lastSeen = device.updatedAt || new Date().toISOString();
            try {
              const hbRes = await fetch(`http://localhost:3000/api/v1/heartbeats/${device.sn}/latest`, {
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Cache-Control': 'no-cache' 
                }
              });
              if (hbRes.ok) {
                const lastHb = await hbRes.json();
                if (lastHb) {
                  lastSeen = lastHb.createdAt || lastHb.timestamp || lastSeen;
                  const diff = Date.now() - new Date(lastSeen).getTime();
                  if (diff < 5 * 60 * 1000 && lastHb.connectivity === 1) {
                    if (lastHb.cpu_usage > 80 || lastHb.temperature > 60) {
                      status = 'warning';
                    } else {
                      status = 'online';
                    }
                  } else {
                    status = 'offline';
                  }
                }
              }
            } catch (error) {
              console.error(`Erro ao buscar último heartbeat para ${device.sn}:`, error);
            }
            return {
              id: device.id,
              name: device.name,
              location: device.location,
              sn: device.sn,
              description: device.description,
              status,
              lastSeen,
            };
          })
        );
        setDevices(devicesWithStatus);
      }
    } catch (err) {
      console.error('Erro ao buscar dispositivos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterDevices = () => {
    let result = devices;

    // Aplicar filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(device => 
        device.name.toLowerCase().includes(term) ||
        device.location.toLowerCase().includes(term) ||
        device.sn.toLowerCase().includes(term) ||
        (device.description && device.description.toLowerCase().includes(term))
      );
    }

    // Aplicar filtro de status
    if (statusFilter !== "all") {
      result = result.filter(device => device.status === statusFilter);
    }

    setFilteredDevices(result);
  };

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/devices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowDeviceForm(false);
        setFormData({ name: "", location: "", sn: "", description: "" });
        fetchUserDevices();
      } else {
        console.error('Erro ao criar dispositivo');
      }
    } catch (error) {
      console.error('Erro ao criar dispositivo:', error);
    }
  };

  const handleUpdateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/v1/devices/${editingDevice.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setEditingDevice(null);
        setFormData({ name: "", location: "", sn: "", description: "" });
        fetchUserDevices();
      } else {
        console.error('Erro ao atualizar dispositivo');
      }
    } catch (error) {
      console.error('Erro ao atualizar dispositivo:', error);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este dispositivo?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/v1/devices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUserDevices();
      } else {
        console.error('Erro ao excluir dispositivo');
      }
    } catch (error) {
      console.error('Erro ao excluir dispositivo:', error);
    }
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      location: device.location,
      sn: device.sn,
      description: device.description || ""
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setShowDeviceForm(false);
    setEditingDevice(null);
    setFormData({ name: "", location: "", sn: "", description: "" });
  };

  const StatusBadge = ({ status }: { status: Device['status'] }) => {
    const statusConfig = {
      online: { color: "bg-green-100 text-green-800", text: "Online" },
      offline: { color: "bg-gray-100 text-gray-800", text: "Offline" },
      warning: { color: "bg-yellow-100 text-yellow-800", text: "Warning" }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
        {statusConfig[status].text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="Dispositivos" />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Gerenciar Dispositivos
            </h2>
            <p className="text-muted-foreground">
              Adicione, edite ou remova dispositivos do sistema
            </p>
          </div>
          
          <Button 
            onClick={() => setShowDeviceForm(true)}
            className="bg-gradient-primary hover:bg-primary/90 text-primary-foreground shadow-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Dispositivo
          </Button>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar dispositivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Todos os status</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
              
              <Button 
                onClick={fetchUserDevices} 
                variant="outline" 
                disabled={refreshing}
                className="whitespace-nowrap"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Dispositivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Seus Dispositivos
              {loading && <RefreshCw className="h-4 w-4 animate-spin ml-2" />}
            </CardTitle>
            <CardDescription>
              {filteredDevices.length} de {devices.length} dispositivo(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Carregando dispositivos...</p>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {devices.length === 0 ? 'Você ainda não possui dispositivos.' : 'Nenhum dispositivo encontrado com os filtros aplicados.'}
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-muted/50 font-medium">
                  <div className="md:col-span-4">Nome</div>
                  <div className="md:col-span-2">Serial</div>
                  <div className="md:col-span-3">Localização</div>
                  <div className="md:col-span-2">Status</div>
                  <div className="md:col-span-1">Ações</div>
                </div>
                
                <div className="divide-y">
                  {filteredDevices.map(device => (
                    <div key={device.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-muted/30">
                      <div className="md:col-span-4">
                        <div className="font-medium">{device.name}</div>
                        {device.description && (
                          <div className="text-sm text-muted-foreground truncate">{device.description}</div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-sm font-mono">{device.sn}</div>
                      </div>
                      <div className="md:col-span-3">
                        <div className="text-sm">{device.location}</div>
                      </div>
                      <div className="md:col-span-2">
                        <StatusBadge status={device.status} />
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(device.lastSeen).toLocaleString()}
                        </div>
                      </div>
                      <div className="md:col-span-1 flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditDevice(device)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteDevice(device.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de formulário */}
      {(showDeviceForm || editingDevice) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingDevice ? 'Editar Dispositivo' : 'Novo Dispositivo'}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form onSubmit={editingDevice ? handleUpdateDevice : handleCreateDevice} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Dispositivo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sn">Número de Série</Label>
                  <Input
                    id="sn"
                    name="sn"
                    value={formData.sn}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (Opcional)</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingDevice ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}