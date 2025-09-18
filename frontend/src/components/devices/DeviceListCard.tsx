import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, RefreshCw } from "lucide-react";
import { DeviceList } from "@/components/devices/DeviceList";
import { Device } from "@/types/device";

interface DeviceListCardProps {
  devices: Device[];
  filteredDevices: Device[];
  loading: boolean;
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
  onSelect: (device: Device) => void;
}

export function DeviceListCard({
  devices,
  filteredDevices,
  loading,
  onEdit,
  onDelete,
  onSelect,
}: DeviceListCardProps) {
  return (
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
          <DeviceList
            devices={filteredDevices}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        )}
      </CardContent>
    </Card>
  );
}
