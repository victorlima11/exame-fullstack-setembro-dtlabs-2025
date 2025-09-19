import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Loader2, MapPin, Hash, FileText } from "lucide-react";
import { API_URL_BASE } from "@/api/api";

interface DeviceFormProps {
  onClose: () => void;
  onDeviceAdded: () => void;
}

export function DeviceForm({ onClose, onDeviceAdded }: DeviceFormProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [sn, setSn] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateSerialNumber = (value: string) => {
    return /^\d{12}$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim() || !location.trim() || !sn.trim()) {
      toast({
        title: "Required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!validateSerialNumber(sn)) {
      toast({
        title: "Invalid Serial Number",
        description: "The serial number must be exactly 12 digits.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const body: any = {
        name: name.trim(),
        location: location.trim(),
        sn: sn.trim(),
      };
      if (description.trim()) {
        body.description = description.trim();
      }
      const response = await fetch(`${API_URL_BASE}/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: "Device Added",
          description: `${name} has been added successfully.`,
        });
        onDeviceAdded();
      } else {
        const error = await response.json();
        console.log('Error adding device:', error);
        toast({
          title: "Error Adding Device",
          description: error.message || "An error occurred while adding the device.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to reach the server. Please try again later.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card border border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Monitor className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>Add New Device</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Device Name *</Label>
              <div className="relative">
                <Monitor className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sn">Serial Number *</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="sn"
                placeholder="SN (12 digits)"
                value={sn}
                onChange={(e) => setSn(e.target.value.replace(/\D/g, '').slice(0, 12))}
                className="pl-10"
                maxLength={12}
                required
              />
            </div>
            {sn && !validateSerialNumber(sn) && (
              <p className="text-sm text-destructive">
                Serial number must be exactly 12 digits.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="pl-10 min-h-[80px]"
                rows={3}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:bg-primary/90 text-primary-foreground shadow-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Device"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}