import { useState, useEffect, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useToast } from "@/hooks/use-toast";
import { Device, Heartbeat } from "@/types/device";

export const useDevicesPage = () => {
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchUserDevices = useCallback(async () => {
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
  }, [authFetch, toast]);

  useEffect(() => {
    fetchUserDevices();
  }, [fetchUserDevices]);

  useEffect(() => {
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
  }, [devices, searchTerm, statusFilter]);

  const handleSaveDevice = async (formData: any) => {
    const isEditing = !!editingDevice;
    const url = isEditing
      ? `http://localhost:3000/api/v1/devices/${editingDevice!.id}`
      : 'http://localhost:3000/api/v1/devices';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      await authFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      setEditingDevice(null);
      setShowCreateForm(false);

      toast({
        title: "Success",
        description: `Device ${isEditing ? 'updated' : 'created'} successfully`,
      });

      fetchUserDevices();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} device:`, error);
      toast({
        title: "Error",
        description: error.error || `Failed to ${isEditing ? 'update' : 'create'} device`,
        variant: "destructive",
      });
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

  const handleNewDeviceClick = () => {
    setEditingDevice(null);
    setShowCreateForm(true);
  };

  const handleEditDevice = (device: Device) => {
    setShowCreateForm(false);
    setEditingDevice(device);
  };

  const handleCloseForm = () => {
    setEditingDevice(null);
    setShowCreateForm(false);
  };

  const handleCloseDetails = () => {
    setSelectedDevice(null);
  };

  return {
    devices,
    filteredDevices,
    editingDevice,
    showCreateForm,
    selectedDevice,
    loading,
    refreshing,
    searchTerm,
    statusFilter,
    fetchUserDevices,
    handleSaveDevice,
    handleDeleteDevice,
    setSearchTerm,
    setStatusFilter,
    setSelectedDevice,
    handleNewDeviceClick,
    handleEditDevice,
    handleCloseForm,
    handleCloseDetails
  };
};
