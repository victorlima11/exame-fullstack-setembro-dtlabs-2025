import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  Cpu,
  Database,
  Thermometer,
  Wifi,
  Clock
} from "lucide-react";
import { Header } from "../../components/header/Header";

interface Heartbeat {
  id: number;
  device_sn: string;
  cpu_usage: string;
  ram_usage: string;
  disk_free: string;
  temperature: string;
  latency: number;
  connectivity: number;
  boot_time: string;
  created_at: string;
}

interface Device {
  id: string;
  name: string;
  location: string;
  sn: string;
  description?: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: string;
  lastHeartbeat?: Heartbeat;
}

export default function DevicesPage() {
  const { user } = useAuth();
  const { authFetch, loading: fetchLoading, error: fetchError } = useAuthFetch();
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
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
  const [formErrors, setFormErrors] = useState({
    name: "",
    location: "",
    sn: ""
  });

  useEffect(() => {
    fetchUserDevices();
  }, []);

  useEffect(() => {
    filterDevices();
  }, [devices, searchTerm, statusFilter]);

  const validateForm = () => {
    const errors = {
      name: "",
      location: "",
      sn: ""
    };
    let isValid = true;

    // Validar nome
    if (!formData.name.trim()) {
      errors.name = "Device name is required";
      isValid = false;
    }

    // Validar localização
    if (!formData.location.trim()) {
      errors.location = "Location is required";
      isValid = false;
    }

    // Validar número de série
    if (!formData.sn.trim()) {
      errors.sn = "Serial number is required";
      isValid = false;
    } else if (!/^\d{12}$/.test(formData.sn)) {
      errors.sn = "Serial number must be exactly 12 digits";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const fetchUserDevices = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const data = await authFetch('http://localhost:3000/api/v1/devices/user');
      const devicesWithStatus = await Promise.all(
        data.map(async (device: any) => {
          let status: Device['status'] = 'offline';
          let lastSeen = device.updatedAt || new Date().toISOString();
          let lastHeartbeat: Heartbeat | undefined;

          try {
            const lastHb = await authFetch(`http://localhost:3000/api/v1/heartbeats/${device.sn}/latest`, {
              cache: 'no-cache'
            });

            if (lastHb) {
              lastHeartbeat = lastHb;
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
          } catch (error) {
            console.error(`Error fetching latest heartbeat for ${device.sn}:`, error);
          }

          return {
            id: device.id,
            name: device.name,
            location: device.location,
            sn: device.sn,
            description: device.description,
            status,
            lastSeen,
            lastHeartbeat
          };
        })
      );
      setDevices(devicesWithStatus);
    } catch (err) {
      console.error('Error fetching devices:', err);
      toast({
        title: "Error",
        description: "Failed to fetch devices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterDevices = () => {
    let result = devices;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(device =>
        device.name.toLowerCase().includes(term) ||
        device.location.toLowerCase().includes(term) ||
        device.sn.toLowerCase().includes(term) ||
        (device.description && device.description.toLowerCase().includes(term))
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(device => device.status === statusFilter);
    }
    setFilteredDevices(result);
  };

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await authFetch('http://localhost:3000/api/v1/devices', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setShowDeviceForm(false);
      setFormData({ name: "", location: "", sn: "", description: "" });
      setFormErrors({ name: "", location: "", sn: "" });

      toast({
        title: "Success",
        description: "Device created successfully",
      });

      fetchUserDevices();
    } catch (error: any) {
      if (error.status === 409) {
        toast({
          title: "Error",
          description: error.error, // agora vem certinho do backend
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to create device | ${error.message || "Unknown error"}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateDevice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingDevice) return;

    if (!validateForm()) {
      return;
    }

    try {
      await authFetch(`http://localhost:3000/api/v1/devices/${editingDevice.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      setEditingDevice(null);
      setFormData({ name: "", location: "", sn: "", description: "" });
      setFormErrors({ name: "", location: "", sn: "" });

      toast({
        title: "Success",
        description: "Device updated successfully",
      });

      fetchUserDevices();
    } catch (error: any) {
      console.error('Error updating device:', error);

      if (error.status === 409) {
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update device",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return;

    try {
      await authFetch(`http://localhost:3000/api/v1/devices/${id}`, { method: 'DELETE' });

      toast({
        title: "Success",
        description: "Device deleted successfully",
      });

      fetchUserDevices();
    } catch (error) {
      console.error('Error deleting device:', error);
      toast({
        title: "Error",
        description: "Failed to delete device",
        variant: "destructive",
      });
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
    setFormErrors({ name: "", location: "", sn: "" });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "sn") {
      // Permitir apenas números e limitar a 12 caracteres
      const numericValue = value.replace(/\D/g, '').slice(0, 12);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSnInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Impedir a digitação de caracteres não numéricos
    if (!/[\d\b]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // Processar colagem: remover caracteres não numéricos e limitar a 12 dígitos
    const pasteData = e.clipboardData.getData('text');
    const numericValue = pasteData.replace(/\D/g, '').slice(0, 12);

    // Atualizar o valor do campo
    setFormData(prev => ({ ...prev, sn: numericValue }));

    // Prevenir a colagem padrão
    e.preventDefault();
  };

  const resetForm = () => {
    setShowDeviceForm(false);
    setEditingDevice(null);
    setSelectedDevice(null);
    setFormData({ name: "", location: "", sn: "", description: "" });
    setFormErrors({ name: "", location: "", sn: "" });
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

  const HeartbeatInfo = ({ device }: { device: Device }) => {
    if (!device.lastHeartbeat) {
      return (
        <div className="text-xs text-muted-foreground mt-1">
          No heartbeat data available
        </div>
      );
    }

    const hb = device.lastHeartbeat;
    return (
      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Cpu className="h-3 w-3" />
          <span>CPU: {hb.cpu_usage}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          <span>RAM: {hb.ram_usage}% | Disk: {hb.disk_free}% free</span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer className="h-3 w-3" />
          <span>Temp: {hb.temperature}°C</span>
          <Wifi className="h-3 w-3 ml-2" />
          <span>Latency: {hb.latency}ms</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{new Date(hb.created_at).toLocaleString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="Devices" />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Manage Devices
            </h2>
            <p className="text-muted-foreground">
              Add, edit, or remove devices from the system
            </p>
          </div>
          <Button
            onClick={() => setShowDeviceForm(true)}
            className="bg-gradient-primary hover:bg-primary/90 text-primary-foreground shadow-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Device
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devices..."
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
                  className="border rounded-md px-3 py-2 text-sm text-black"
                >
                  <option value="all">All Statuses</option>
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
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Your Devices
              {loading && <RefreshCw className="h-4 w-4 animate-spin ml-2" />}
            </CardTitle>
            <CardDescription>
              {filteredDevices.length} of {devices.length} device(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading devices...</p>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {devices.length === 0 ? 'You do not have any devices yet.' : 'No devices found with applied filters.'}
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-muted/50 font-medium">
                  <div className="md:col-span-3">Name</div>
                  <div className="md:col-span-2">Serial</div>
                  <div className="md:col-span-3">Location</div>
                  <div className="md:col-span-3">Status & Heartbeat</div>
                  <div className="md:col-span-1">Actions</div>
                </div>
                <div className="divide-y">
                  {filteredDevices.map(device => (
                    <div
                      key={device.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-muted/30 cursor-pointer"
                      onClick={() => setSelectedDevice(device)}
                    >
                      <div className="md:col-span-3">
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
                      <div className="md:col-span-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={device.status} />
                        </div>
                        <HeartbeatInfo device={device} />
                      </div>
                      <div className="md:col-span-1 flex space-x-2" onClick={(e) => e.stopPropagation()}>
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

      {(showDeviceForm || editingDevice) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingDevice ? 'Edit Device' : 'New Device'}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={editingDevice ? handleUpdateDevice : handleCreateDevice} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Device Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className={formErrors.name ? "border-destructive" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-destructive">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sn">Serial Number *</Label>
                  <Input
                    id="sn"
                    name="sn"
                    value={formData.sn}
                    onChange={handleFormChange}
                    onKeyPress={handleSnInput}
                    onPaste={handleSnPaste}
                    required
                    className={formErrors.sn ? "border-destructive" : ""}
                    placeholder="Exactly 12 digits"
                    maxLength={12}
                    inputMode="numeric"
                  />
                  {formErrors.sn && (
                    <p className="text-sm text-destructive">{formErrors.sn}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.sn.length}/12 digits
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    required
                    className={formErrors.location ? "border-destructive" : ""}
                  />
                  {formErrors.location && (
                    <p className="text-sm text-destructive">{formErrors.location}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingDevice ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedDevice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Device Details</h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedDevice(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-muted-foreground">Device Information</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedDevice.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serial Number:</span>
                      <span className="font-mono">{selectedDevice.sn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{selectedDevice.location}</span>
                    </div>
                    {selectedDevice.description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Description:</span>
                        <span>{selectedDevice.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <StatusBadge status={selectedDevice.status} />
                    </div>
                  </div>
                </div>

                {selectedDevice.lastHeartbeat && (
                  <div>
                    <h4 className="font-medium text-muted-foreground">Last Heartbeat</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Timestamp:</span>
                        <span>{new Date(selectedDevice.lastHeartbeat.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CPU Usage:</span>
                        <span>{selectedDevice.lastHeartbeat.cpu_usage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RAM Usage:</span>
                        <span>{selectedDevice.lastHeartbeat.ram_usage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Disk Free:</span>
                        <span>{selectedDevice.lastHeartbeat.disk_free}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span>{selectedDevice.lastHeartbeat.temperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Latency:</span>
                        <span>{selectedDevice.lastHeartbeat.latency}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Connectivity:</span>
                        <span>{selectedDevice.lastHeartbeat.connectivity === 1 ? 'Connected' : 'Disconnected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Boot:</span>
                        <span>{new Date(selectedDevice.lastHeartbeat.boot_time).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-6">
                <Button variant="outline" onClick={() => setSelectedDevice(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}