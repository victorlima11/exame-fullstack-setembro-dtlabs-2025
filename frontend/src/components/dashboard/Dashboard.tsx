import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeviceList } from "./DeviceList";
import { DeviceForm } from "./DeviceForm";
import { NotificationRules } from "./NotificationRules";
import { Notifications } from "./Notifications";
import { TelemetryOverview } from "./TelemetryOverview";
import { Header } from "../global/Header";
import { 
  Plus, 
  Activity, 
  Bell, 
  Settings, 
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Device {
  id: string;
  name: string;
  location: string;
  sn: string;
  description?: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [telemetryData, setTelemetryData] = useState({
    avgCpu: 0,
    avgMemory: 0,
    avgTemperature: 0,
    totalDevices: 0,
    onlineDevices: 0,
  });

  useEffect(() => {
    fetchUserDevices();
  }, []);

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
                headers: { 'Cache-Control': 'no-cache' }
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
        await calculateTelemetryMetrics(devicesWithStatus);
      }
    } catch (err) {
      console.error('Erro ao buscar dispositivos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateTelemetryMetrics = async (devices: Device[]) => {
    if (devices.length === 0) {
      setTelemetryData({
        avgCpu: 0,
        avgMemory: 0,
        avgTemperature: 0,
        totalDevices: 0,
        onlineDevices: 0,
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const onlineDevices = devices.filter(d => d.status === 'online' || d.status === 'warning').length;
      
      const telemetryPromises = devices
        .filter(device => device.status === 'online' || device.status === 'warning')
        .map(async (device) => {
          try {
            const response = await fetch(
              `http://localhost:3000/api/v1/heartbeats/${device.sn}/latest`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            
            if (response.ok) {
              const heartbeat = await response.json();
              return {
                cpu: parseFloat(heartbeat.cpu_usage) || 0,
                memory: parseFloat(heartbeat.ram_usage) || 0,
                temperature: parseFloat(heartbeat.temperature) || 0,
              };
            }
            return null;
          } catch (error) {
            console.error(`Erro ao buscar heartbeat para cálculo de métricas: ${device.sn}`, error);
            return null;
          }
        });

      const telemetryResults = (await Promise.all(telemetryPromises)).filter(result => result !== null);
      
      if (telemetryResults.length > 0) {
        const avgCpu = telemetryResults.reduce((sum, val) => sum + val!.cpu, 0) / telemetryResults.length;
        const avgMemory = telemetryResults.reduce((sum, val) => sum + val!.memory, 0) / telemetryResults.length;
        const avgTemperature = telemetryResults.reduce((sum, val) => sum + val!.temperature, 0) / telemetryResults.length;

        setTelemetryData({
          avgCpu,
          avgMemory,
          avgTemperature,
          totalDevices: devices.length,
          onlineDevices,
        });
      } else {
        setTelemetryData({
          avgCpu: 0,
          avgMemory: 0,
          avgTemperature: 0,
          totalDevices: devices.length,
          onlineDevices,
        });
      }
    } catch (error) {
      console.error('Erro ao calcular métricas de telemetria:', error);
      setTelemetryData({
        avgCpu: 0,
        avgMemory: 0,
        avgTemperature: 0,
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.status === 'online' || d.status === 'warning').length,
      });
    }
  };

  const handleDeviceAdded = () => {
    setShowDeviceForm(false);
    fetchUserDevices();
  };

  const handleRefresh = () => {
    fetchUserDevices();
  };

  const handleRuleUpdated = () => {
    console.log("Regra atualizada com sucesso");
  };

  // Limitar a exibição para apenas 2 dispositivos no dashboard
  const limitedDevices = devices.slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Componentizado */}
      <Header currentPage="Dashboard" />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Bem-vindo de volta, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Monitore e gerencie todos os seus dispositivos em tempo real
          </p>
        </div>

        {/* Telemetry Overview */}
        <TelemetryOverview data={telemetryData} loading={loading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Devices Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border/50 bg-gradient-card shadow-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <span>Seus Dispositivos</span>
                      {loading && <RefreshCw className="h-4 w-4 animate-spin ml-2" />}
                    </CardTitle>
                    <CardDescription>
                      {devices.length} dispositivo{devices.length !== 1 ? 's' : ''} conectado{devices.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate('/devices')}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      Ver Todos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button 
                      onClick={() => setShowDeviceForm(true)}
                      className="bg-gradient-primary hover:bg-primary/90 text-primary-foreground shadow-primary whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DeviceList devices={limitedDevices} onUpdate={fetchUserDevices} loading={loading} />
                {devices.length > 2 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button 
                      onClick={() => navigate('/devices')}
                      variant="link"
                      className="w-full justify-center"
                    >
                      Ver todos os {devices.length} dispositivos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Rules */}
            <Card className="border border-border/50 bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>Regras de Notificação</span>
                </CardTitle>
                <CardDescription>
                  Configure alertas automáticos para seus dispositivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationRules 
                  devices={devices} 
                  onRuleAdded={fetchUserDevices}
                  onRuleDeleted={fetchUserDevices}
                  onRuleUpdated={handleRuleUpdated}
                />
              </CardContent>
            </Card>
          </div>

          {/* Notifications Section */}
          <div className="space-y-6">
            <Card className="border border-border/50 bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Notificações</span>
                </CardTitle>
                <CardDescription>
                  Alertas e eventos em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Notifications />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Device Form Modal */}
      {showDeviceForm && (
        <DeviceForm 
          onClose={() => setShowDeviceForm(false)}
          onDeviceAdded={handleDeviceAdded}
        />
      )}
    </div>
  );
}