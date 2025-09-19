import { useState } from "react";
import { Monitor, MapPin, Calendar, Edit, Trash2, Wifi, WifiOff, AlertTriangle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

interface DeviceListProps {
  devices: Device[];
  onUpdate: () => void;
  loading: boolean;
}

export function DeviceList({ devices, onUpdate, loading }: DeviceListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const openEditModal = (device: Device) => {
    setEditingDevice(device);
    setEditName(device.name);
    setEditLocation(device.location);
    setEditDescription(device.description || "");
  };

  const getStatusIcon = (status: Device['status']) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Device['status']) => {
    switch (status) {
      case 'online':
        return { variant: 'default' as const, text: 'Online', class: 'bg-green-500 text-white' };
      case 'offline':
        return { variant: 'secondary' as const, text: 'Offline', class: 'bg-gray-500 text-white' };
      case 'warning':
        return { variant: 'secondary' as const, text: 'Warning', class: 'bg-yellow-500 text-white' };
      default:
        return { variant: 'secondary' as const, text: 'Offline', class: 'bg-gray-500 text-white' };
    }
  };

  const formatLastSeen = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      if (diff < 60000) return 'Right now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}min ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDelete = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    setDeletingId(deviceId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL_BASE}/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        onUpdate();
      } else {
        alert('Error at deleting device');
      }
    } catch (err) {
      alert('Network error at deleting device');
    }
    setDeletingId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL_BASE}/devices/${editingDevice.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          location: editLocation.trim(),
          description: editDescription.trim(),
        }),
      });
      if (response.ok) {
        setEditingDevice(null);
        onUpdate();
      } else {
        alert('Error at editing device');
      }
    } catch (err) {
      alert('Network error at editing device');
    }
    setEditLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onUpdate();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-12">
        <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No devices found</h3>
        <p className="text-muted-foreground mb-4">
          Add your first device to start monitoring
        </p>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {devices.map((device) => {
        const statusInfo = getStatusBadge(device.status);
        return (
          <div key={device.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                  <Monitor className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{device.name}</h4>
                    <Badge className={statusInfo.class}>
                      {statusInfo.text}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{device.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatLastSeen(device.lastSeen)}</span>
                    </div>
                  </div>
                  {device.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {device.description}
                    </p>
                  )}
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    SN: {device.sn}
                  </code>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => openEditModal(device)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(device.id)}
                  disabled={deletingId === device.id}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
      {editingDevice && (
        <Dialog open={true} onOpenChange={() => setEditingDevice(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Device</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="editName">Name</Label>
                <Input id="editName" value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="editLocation">Location</Label>
                <Input id="editLocation" value={editLocation} onChange={e => setEditLocation(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Input id="editDescription" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingDevice(null)} disabled={editLoading}>Cancel</Button>
                <Button type="submit" disabled={editLoading} className="bg-gradient-primary text-black">
                  {editLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}