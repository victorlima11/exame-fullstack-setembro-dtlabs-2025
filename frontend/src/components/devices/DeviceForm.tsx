import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";

interface Device {
  id: string;
  name: string;
  location: string;
  sn: string;
  description?: string;
}

interface DeviceFormProps {
  device: Device | null;
  onSave: (deviceData: any) => Promise<void>;
  onClose: () => void;
}

export function DeviceForm({ device, onSave, onClose }: DeviceFormProps) {
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
    if (device) {
      setFormData({
        name: device.name,
        location: device.location,
        sn: device.sn,
        description: device.description || ""
      });
    } else {
      setFormData({
        name: "",
        location: "",
        sn: "",
        description: ""
      });
    }
    setFormErrors({ name: "", location: "", sn: "" });
  }, [device]);

  const validateForm = () => {
    const errors = {
      name: "",
      location: "",
      sn: ""
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Device name is required";
      isValid = false;
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required";
      isValid = false;
    }

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "sn") {
      const numericValue = value.replace(/\D/g, '').slice(0, 12);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSnInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[\d\b]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text');
    const numericValue = pasteData.replace(/\D/g, '').slice(0, 12);
    setFormData(prev => ({ ...prev, sn: numericValue }));
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {device ? 'Edit Device' : 'New Device'}
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={!!device}
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
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {device ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
