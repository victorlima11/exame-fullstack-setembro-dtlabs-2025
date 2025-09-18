import { Card, CardContent } from "@/components/ui/card";
import { Header } from "../../components/header/Header";
import { DeviceToolbar } from "@/components/devices/DeviceToolbar";
import { DeviceForm } from "@/components/devices/DeviceForm";
import { DeviceDetails } from "@/components/devices/DeviceDetails";
import { useDevicesPage } from "@/hooks/useDevicesPage";
import { DevicesPageHeader } from "@/components/devices/DevicesPageHeader";
import { DeviceListCard } from "@/components/devices/DeviceListCard";

export default function DevicesPage() {
  const {
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
    handleCloseDetails,
  } = useDevicesPage();

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="Devices" />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <DevicesPageHeader onNewDeviceClick={handleNewDeviceClick} />

        <Card>
          <CardContent className="pt-6">
            <DeviceToolbar
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onRefresh={fetchUserDevices}
              refreshing={refreshing}
            />
          </CardContent>
        </Card>

        <DeviceListCard
          devices={devices}
          filteredDevices={filteredDevices}
          loading={loading}
          onEdit={handleEditDevice}
          onDelete={handleDeleteDevice}
          onSelect={setSelectedDevice}
        />
      </div>

      {(showCreateForm || editingDevice) && (
        <DeviceForm
          device={editingDevice}
          onSave={handleSaveDevice}
          onClose={handleCloseForm}
        />
      )}

      {selectedDevice && (
        <DeviceDetails
          device={selectedDevice}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}
