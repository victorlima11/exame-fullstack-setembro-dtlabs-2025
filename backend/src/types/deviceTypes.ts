// types/deviceTypes.ts
export interface NewDevice {
  name: string;
  location: string;
  sn: string;
  description: string;
  user_id: string;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  sn: string;
  description: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface DeviceFilters {
  userId?: string;
  name?: string;
  location?: string;
  sn?: string;
}