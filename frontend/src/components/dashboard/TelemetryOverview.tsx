import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Cpu, 
  HardDrive, 
  Thermometer, 
  Monitor, 
  Wifi, 
  TrendingUp 
} from "lucide-react";

interface TelemetryData {
  avgCpu: number;
  avgMemory: number;
  avgTemperature: number;
  totalDevices: number;
  onlineDevices: number;
}

interface TelemetryOverviewProps {
  data: TelemetryData;
  loading: boolean;
}

export function TelemetryOverview({ data, loading }: TelemetryOverviewProps) {
  const getStatusColor = (value: number, type: 'cpu' | 'memory' | 'temperature') => {
    switch (type) {
      case 'cpu':
      case 'memory':
        if (value < 50) return 'text-success';
        if (value < 80) return 'text-warning';
        return 'text-destructive';
      case 'temperature':
        if (value < 40) return 'text-success';
        if (value < 60) return 'text-warning';
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (value: number, type: 'cpu' | 'memory' | 'temperature'): 'default' | 'destructive' | 'secondary' => {
    switch (type) {
      case 'cpu':
      case 'memory':
        if (value < 50) return 'default';
        if (value < 80) return 'secondary';
        return 'destructive';
      case 'temperature':
        if (value < 40) return 'default';
        if (value < 60) return 'secondary';
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border border-border/50 bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "CPU Médio",
      value: `${data.avgCpu.toFixed(1)}%`,
      icon: Cpu,
      color: getStatusColor(data.avgCpu, 'cpu'),
      badge: getStatusBadge(data.avgCpu, 'cpu'),
    },
    {
      title: "Memória Média",
      value: `${data.avgMemory.toFixed(1)}%`,
      icon: HardDrive,
      color: getStatusColor(data.avgMemory, 'memory'),
      badge: getStatusBadge(data.avgMemory, 'memory'),
    },
    {
      title: "Temperatura",
      value: `${data.avgTemperature.toFixed(1)}°C`,
      icon: Thermometer,
      color: getStatusColor(data.avgTemperature, 'temperature'),
      badge: getStatusBadge(data.avgTemperature, 'temperature'),
    },
    {
      title: "Total Dispositivos",
      value: data.totalDevices.toString(),
      icon: Monitor,
      color: "text-primary",
      badge: "default" as const,
    },
    {
      title: "Dispositivos Online",
      value: `${data.onlineDevices}/${data.totalDevices}`,
      icon: Wifi,
      color: data.onlineDevices === data.totalDevices ? "text-success" : 
             data.onlineDevices > 0 ? "text-warning" : "text-destructive",
      badge: data.onlineDevices === data.totalDevices ? "default" : 
             data.onlineDevices > 0 ? "secondary" : "destructive",
    } as const,
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="border border-border/50 bg-gradient-card shadow-card hover:shadow-primary/20 transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span>{metric.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <Badge variant={metric.badge} className="ml-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}