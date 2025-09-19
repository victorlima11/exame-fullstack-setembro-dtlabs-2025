import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeviceList } from "../../components/dashboard/DeviceList";
import { DeviceForm } from "../../components/dashboard/DeviceForm";
import { Notifications } from "../../components/dashboard/Notifications";
import { TelemetryOverview } from "../../components/dashboard/TelemetryOverview";
import { Header } from "../../components/header/Header";
import { Plus, Activity, Bell, RefreshCw, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL_BASE } from "@/api/api";

interface Device {
  id: string;
  name: string;
  location: string;
  sn: string;
  description?: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { authFetch } = useAuthFetch();
  const [devices, setDevices] = useState<Device[]>([]);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [loading, setLoading] = useState(true);
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
    try {
      const data = await authFetch(`${API_URL_BASE}/devices/user`);
      const devicesWithStatus = await Promise.all(
        data.map(async (device: any) => {
          let status: Device['status'] = 'offline';
          let lastSeen = device.updatedAt || new Date().toISOString();

          try {
            const lastHb = await authFetch(`${API_URL_BASE}/heartbeats/${device.sn}/latest`);
            if (lastHb) {
              lastSeen = lastHb.createdAt || lastHb.timestamp || lastSeen;
              const diff = Date.now() - new Date(lastSeen).getTime();
              if (diff < 5 * 60 * 1000 && lastHb.connectivity === 1) {
                if (lastHb.cpu_usage > 80 || lastHb.temperature > 60) {
                  status = 'warning';
                } else {
                  status = 'online';
                }
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
          };
        })
      );

      setDevices(devicesWithStatus);
      calculateTelemetryMetrics(devicesWithStatus);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTelemetryMetrics = async (devices: Device[]) => {
    if (!devices.length) {
      setTelemetryData({
        avgCpu: 0,
        avgMemory: 0,
        avgTemperature: 0,
        totalDevices: 0,
        onlineDevices: 0,
      });
      return;
    }

    const onlineDevices = devices.filter(d => d.status === 'online' || d.status === 'warning');

    const telemetryPromises = onlineDevices.map(async (device) => {
      try {
        const heartbeat = await authFetch(`${API_URL_BASE}/heartbeats/${device.sn}/latest`);
        return {
          cpu: parseFloat(heartbeat.cpu_usage) || 0,
          memory: parseFloat(heartbeat.ram_usage) || 0,
          temperature: parseFloat(heartbeat.temperature) || 0,
        };
      } catch (error) {
        console.error(`Error fetching heartbeat for telemetry calculation: ${device.sn}`, error);
        return null;
      }
    });

    const telemetryResults = (await Promise.all(telemetryPromises)).filter(Boolean);

    if (telemetryResults.length > 0) {
      const avgCpu = telemetryResults.reduce((sum, val) => sum + val!.cpu, 0) / telemetryResults.length;
      const avgMemory = telemetryResults.reduce((sum, val) => sum + val!.memory, 0) / telemetryResults.length;
      const avgTemperature = telemetryResults.reduce((sum, val) => sum + val!.temperature, 0) / telemetryResults.length;

      setTelemetryData({
        avgCpu,
        avgMemory,
        avgTemperature,
        totalDevices: devices.length,
        onlineDevices: onlineDevices.length,
      });
    } else {
      setTelemetryData({
        avgCpu: 0,
        avgMemory: 0,
        avgTemperature: 0,
        totalDevices: devices.length,
        onlineDevices: onlineDevices.length,
      });
    }
  };

  const handleDeviceAdded = () => {
    setShowDeviceForm(false);
    fetchUserDevices();
  };

  const limitedDevices = devices.slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="Dashboard" />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage all your devices in real time
          </p>
        </div>

        <TelemetryOverview data={telemetryData} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border/50 bg-gradient-card shadow-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <span>Your Devices</span>
                      {loading && <RefreshCw className="h-4 w-4 animate-spin ml-2" />}
                    </CardTitle>
                    <CardDescription>
                      {devices.length} device{devices.length !== 1 ? 's' : ''} connected
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate('/devices')}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button 
                      onClick={() => setShowDeviceForm(true)}
                      className="bg-gradient-primary hover:bg-primary/90 text-primary-foreground shadow-primary whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
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
                      View all {devices.length} devices
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-border/50 bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Real-time alerts and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Notifications />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showDeviceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-lg p-6 z-10">
            <DeviceForm 
              onClose={() => setShowDeviceForm(false)}
              onDeviceAdded={handleDeviceAdded}
            />
          </div>
        </div>
      )}
    </div>
  );
}
