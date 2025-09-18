import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Cpu,
  Database,
  Thermometer,
  Wifi,
  Clock
} from "lucide-react";

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

interface DeviceListProps {
  devices: Device[];
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
  onSelect: (device: Device) => void;
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

export function DeviceList({ devices, onEdit, onDelete, onSelect }: DeviceListProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-muted/50 font-medium">
        <div className="md:col-span-3">Name</div>
        <div className="md:col-span-2">Serial</div>
        <div className="md:col-span-3">Location</div>
        <div className="md:col-span-3">Status & Heartbeat</div>
        <div className="md:col-span-1">Actions</div>
      </div>
      <div className="divide-y">
        {devices.map(device => (
          <div
            key={device.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-muted/30 cursor-pointer"
            onClick={() => onSelect(device)}
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
                onClick={() => onEdit(device)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(device.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
