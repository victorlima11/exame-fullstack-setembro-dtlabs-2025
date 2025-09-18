import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DevicesPageHeaderProps {
  onNewDeviceClick: () => void;
}

export function DevicesPageHeader({ onNewDeviceClick }: DevicesPageHeaderProps) {
  return (
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
        onClick={onNewDeviceClick}
        className="bg-gradient-primary hover:bg-primary/90 text-primary-foreground shadow-primary"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Device
      </Button>
    </div>
  );
}
