import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
 SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

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

interface DateRange {
  start: Date;
  end: Date;
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

const formatChartData = (heartbeats: Heartbeat[]) => {
  const sortedHeartbeats = [...heartbeats].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  return sortedHeartbeats.map(hb => {
    const d = new Date(hb.created_at);
    return {
      timestamp: d.getTime(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTime: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: d.toLocaleDateString(),
      xAxisLabel: `${format(d, "HH:mm")}-${d.getTime()}`,
      cpu: parseFloat(hb.cpu_usage),
      ram: parseFloat(hb.ram_usage),
      disk: parseFloat(hb.disk_free),
      temp: parseFloat(hb.temperature),
      latency: hb.latency,
      connectivity: hb.connectivity
    }
  });
};

const formatDateForAPI = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss").replace(/:/g, '%3A');
};

const adjustTimezone = (date: Date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + timezoneOffset);
};

const DateRangeSelector = ({ 
  dateRange, 
  setDateRange 
}: { 
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}) => {
  const [startDateInput, setStartDateInput] = useState(format(dateRange.start, "yyyy-MM-dd"));
  const [endDateInput, setEndDateInput] = useState(format(dateRange.end, "yyyy-MM-dd"));

  const handleApply = () => {
    const start = new Date(startDateInput);
    start.setHours(0, 0, 0, 0);
    const adjustedStart = adjustTimezone(start);
    
    const end = new Date(endDateInput);
    end.setHours(23, 59, 59, 999);
    const adjustedEnd = adjustTimezone(end);
    
    setDateRange({ start: adjustedStart, end: adjustedEnd });
  };

  const presetRanges = [
    { label: "Today", days: 0 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
  ];

  const applyPresetRange = (days: number) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const adjustedEnd = adjustTimezone(end);
    
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    const adjustedStart = adjustTimezone(start);
    
    setDateRange({ start: adjustedStart, end: adjustedEnd });
    setStartDateInput(format(adjustedStart, "yyyy-MM-dd"));
    setEndDateInput(format(adjustedEnd, "yyyy-MM-dd"));
  };

  useEffect(() => {
    setStartDateInput(format(dateRange.start, "yyyy-MM-dd"));
    setEndDateInput(format(dateRange.end, "yyyy-MM-dd"));
  }, [dateRange]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted rounded-md">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Select Date Range</span>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground mb-1">Start Date</label>
            <input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground mb-1">End Date</label>
            <input
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            />
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleApply} className="h-10">
              Apply
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Quick Select</span>
        <div className="flex gap-2 flex-wrap">
          {presetRanges.map((range) => (
            <Button
              key={range.days}
              variant="outline"
              size="sm"
              onClick={() => applyPresetRange(range.days)}
              className="text-xs"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export function DeviceDetails({ device, onClose }: DeviceDetailsProps) {
  const [heartbeats, setHeartbeats] = useState<Heartbeat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: adjustTimezone(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    end: adjustTimezone(new Date()),
  });
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    const fetchHeartbeats = async () => {
      try {
        setIsLoading(true);
        
        // Format dates for API URL
        const startParam = formatDateForAPI(dateRange.start);
        const endParam = formatDateForAPI(dateRange.end);
        
        const response = await fetch(
          `http://localhost:3000/api/v1/heartbeats/${device.sn}?start=${startParam}&end=${endParam}&limit=1000`
        );
        
        const data = await response.json();
        setHeartbeats(data.heartbeats || []);
      } catch (error) {
        console.error("Error fetching heartbeats:", error);
        setHeartbeats([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeartbeats();
  }, [device.sn, dateRange]);

  const chartData = formatChartData(heartbeats);
  const tickInterval = chartData.length > 5 ? Math.ceil(chartData.length / 4) : 1;

  const chartConfig = {
    cpu: { label: "CPU Usage", color: "#8884d8", unit: "%" },
    ram: { label: "RAM Usage", color: "#82ca9d", unit: "%" },
    disk: { label: "Disk Free", color: "#ffc658", unit: "%" },
    temp: { label: "Temperature", color: "#ff8042", unit: "°C" },
    latency: { label: "Latency", color: "#0088FE", unit: "ms" },
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-background p-3 border rounded shadow-md">
          <p className="font-medium">{format(new Date(point.timestamp), "MMM dd, yyyy HH:mm:ss")}</p>
          {payload.map((entry: any, index: number) => {
            let unit = "";
            if (entry.dataKey === 'cpu' || entry.dataKey === 'ram' || entry.dataKey === 'disk') {
              unit = "%";
            } else if (entry.dataKey === 'temp') {
              unit = "°C";
            } else if (entry.dataKey === 'latency') {
              unit = "ms";
            }
            
            return (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: {entry.value} {unit}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const formatXAxisTick = (tick: string) => {
    if (!tick) return "";
    return tick.split('-')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Device Details</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
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

            <div className="space-y-4">
              <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />
              
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Chart Type</span>
                <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                Showing data from <strong>{format(dateRange.start, "MMM dd, yyyy")}</strong> to <strong>{format(dateRange.end, "MMM dd, yyyy")}</strong>
                {chartData.length > 0 && ` - ${chartData.length} records found`}
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading heartbeat data...</p>
              </div>
            ) : chartData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>CPU Usage</CardTitle>
                    <CardDescription>Percentage of CPU usage over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      {chartType === 'line' ? (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="xAxisLabel"
                            interval={tickInterval}
                            tickFormatter={formatXAxisTick}
                          />
                          <YAxis domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="cpu" 
                            name="CPU Usage"
                            stroke={chartConfig.cpu.color} 
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="xAxisLabel" 
                            interval={tickInterval}
                            tickFormatter={formatXAxisTick}
                          />
                          <YAxis domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="cpu" 
                            name="CPU Usage"
                            fill={chartConfig.cpu.color}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>RAM Usage</CardTitle>
                    <CardDescription>Percentage of RAM usage over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      {chartType === 'line' ? (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="xAxisLabel" 
                            interval={tickInterval}
                            tickFormatter={formatXAxisTick}
                          />
                          <YAxis domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="ram" 
                            name="RAM Usage"
                            stroke={chartConfig.ram.color} 
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="xAxisLabel" 
                            interval={tickInterval}
                            tickFormatter={formatXAxisTick}
                          />
                          <YAxis domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="ram" 
                            name="RAM Usage"
                            fill={chartConfig.ram.color}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Disk Free Space</CardTitle>
                    <CardDescription>Percentage of free disk space over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      {chartType === 'line' ? (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="xAxisLabel" 
                            interval={tickInterval}
                            tickFormatter={formatXAxisTick}
                          />
                          <YAxis domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="disk" 
                            name="Disk Free"
                            stroke={chartConfig.disk.color} 
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="xAxisLabel" 
                            interval={tickInterval}
                            tickFormatter={formatXAxisTick}
                          />
                          <YAxis domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="disk" 
                            name="Disk Free"
                            fill={chartConfig.disk.color}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Temperature</CardTitle>
                    <CardDescription>Device temperature over time (°C)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      {chartType === 'line' ? (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="xAxisLabel" 
                            interval={tickInterval}
                            tickFormatter={formatXAxisTick}
                          />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="temp" 
                            name="Temperature"
                            stroke={chartConfig.temp.color} 
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="xAxisLabel" 
                            interval={tickInterval}
                            tickFormatter={formatXAxisTick}
                          />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="temp" 
                            name="Temperature"
                            fill={chartConfig.temp.color}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle>Latency</CardTitle>
                    <CardDescription>Network latency over time (ms)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      {chartType === 'line' ? (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="xAxisLabel" 
                            interval={tickInterval}
                            tickFormatter={formatXAxisTick}
                          />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="latency" 
                            name="Latency"
                            stroke={chartConfig.latency.color} 
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="xAxisLabel" 
                            interval={tickInterval}
                            tickFormatter={formatXAxisTick}
                          />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="latency" 
                            name="Latency"
                            fill={chartConfig.latency.color}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">No heartbeat data available for the selected date range.</p>
                </CardContent>
              </Card>
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