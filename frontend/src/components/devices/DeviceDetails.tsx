import { Button } from "@/components/ui/button";
import { X, Cpu, Database, Thermometer, Wifi, Clock } from "lucide-react";

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

interface DeviceDetailsProps {
  device: Device;
  onClose: () => void;
}

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

export function DeviceDetails({ device, onClose }: DeviceDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Device Details</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-muted-foreground">Device Information</h4>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{device.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serial Number:</span>
                  <span className="font-mono">{device.sn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{device.location}</span>
                </div>
                {device.description && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description:</span>
                    <span>{device.description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <StatusBadge status={device.status} />
                </div>
              </div>
            </div>

            {device.lastHeartbeat && (
              <div>
                <h4 className="font-medium text-muted-foreground">Last Heartbeat</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span>{new Date(device.lastHeartbeat.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPU Usage:</span>
                    <span>{device.lastHeartbeat.cpu_usage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RAM Usage:</span>
                    <span>{device.lastHeartbeat.ram_usage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disk Free:</span>
                    <span>{device.lastHeartbeat.disk_free}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperature:</span>
                    <span>{device.lastHeartbeat.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latency:</span>
                    <span>{device.lastHeartbeat.latency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connectivity:</span>
                    <span>{device.lastHeartbeat.connectivity === 1 ? 'Connected' : 'Disconnected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Boot:</span>
                    <span>{new Date(device.lastHeartbeat.boot_time).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-6">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
