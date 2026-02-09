import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Ambulance, 
  Flame, 
  AlertTriangle,
  RefreshCw,
  MapPin,
  Clock,
  Phone,
  User,
  Filter,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { Emergency, DashboardStats } from '@/types';
import { STATUS_WORKFLOW, SERVICE_COLORS, SEVERITY_COLORS, STATUS_COLORS } from '@/types';
import { apiService } from '@/services/api';

interface ResponderDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResponderDashboard({ isOpen, onClose }: ResponderDashboardProps) {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filter, setFilter] = useState({ status: '', service: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [emergenciesRes, statsRes] = await Promise.all([
        apiService.getAllEmergencies(filter),
        apiService.getStats(),
      ]);
      
      if (emergenciesRes.success) {
        setEmergencies(emergenciesRes.emergencies);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, filter]);

  const updateStatus = async (emergencyId: string, newStatus: string) => {
    try {
      await apiService.updateEmergencyStatus(emergencyId, newStatus);
      fetchData();
      if (selectedEmergency?.id === emergencyId) {
        setSelectedEmergency(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-auto">
      <div className="min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-500" />
              Responder Dashboard
            </h2>
            <p className="text-gray-400 mt-1">Real-time emergency management system</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={isLoading}
              className="border-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="destructive"
              onClick={onClose}
            >
              Close Dashboard
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Emergencies"
              value={stats.total_emergencies}
              icon={Activity}
              color="text-blue-400"
            />
            <StatCard
              title="Active"
              value={stats.active_emergencies}
              icon={AlertCircle}
              color="text-red-400"
            />
            <StatCard
              title="Resolved"
              value={stats.resolved_emergencies}
              icon={CheckCircle2}
              color="text-green-400"
            />
            <StatCard
              title="Avg Response"
              value={stats.average_response_time}
              icon={Clock}
              color="text-yellow-400"
            />
          </div>
        )}

        {/* Service Breakdown */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <ServiceCard
              service="Police"
              count={stats.service_breakdown.police}
              icon={Shield}
              color="bg-blue-500"
            />
            <ServiceCard
              service="Ambulance"
              count={stats.service_breakdown.ambulance}
              icon={Ambulance}
              color="bg-red-500"
            />
            <ServiceCard
              service="Fire"
              count={stats.service_breakdown.fire}
              icon={Flame}
              color="bg-orange-500"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter:</span>
          </div>
          <Select value={filter.status} onValueChange={(v) => setFilter(f => ({ ...f, status: v }))}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {STATUS_WORKFLOW.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filter.service} onValueChange={(v) => setFilter(f => ({ ...f, service: v }))}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Services</SelectItem>
              <SelectItem value="police">Police</SelectItem>
              <SelectItem value="ambulance">Ambulance</SelectItem>
              <SelectItem value="fire">Fire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Emergency List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Emergency Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Emergency Reports ({emergencies.length})
            </h3>
            {emergencies.map((emergency) => (
              <Card 
                key={emergency.id}
                className={`cursor-pointer transition-all hover:scale-[1.02] ${
                  selectedEmergency?.id === emergency.id ? 'border-red-500 shadow-glow' : 'border-white/10'
                }`}
                onClick={() => setSelectedEmergency(emergency)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-gray-400">#{emergency.id}</span>
                        <Badge className={`${SEVERITY_COLORS[emergency.analysis.severity].bg} text-white`}>
                          {emergency.analysis.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">{emergency.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {emergency.timestamp}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {emergency.location || 'No location'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {emergency.analysis.services.map(service => {
                        const Icon = service === 'police' ? Shield : service === 'ambulance' ? Ambulance : Flame;
                        const colors = SERVICE_COLORS[service as keyof typeof SERVICE_COLORS];
                        return (
                          <Icon key={service} className={`w-4 h-4 ${colors.text}`} />
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge variant="outline" className={`${STATUS_COLORS[emergency.status]?.text} ${STATUS_COLORS[emergency.status]?.border}`}>
                      {emergency.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Emergency Detail */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Emergency Details
            </h3>
            {selectedEmergency ? (
              <Card className="border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">#{selectedEmergency.id}</CardTitle>
                    <Badge className={`${SEVERITY_COLORS[selectedEmergency.analysis.severity].bg} text-white`}>
                      {selectedEmergency.analysis.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  <div>
                    <label className="text-sm text-gray-400">Description</label>
                    <p className="text-sm mt-1">{selectedEmergency.description}</p>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm text-gray-400">Location</label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-400" />
                      {selectedEmergency.location || 'Not provided'}
                    </p>
                  </div>

                  {/* Contact */}
                  {(selectedEmergency.contact_name || selectedEmergency.contact_phone) && (
                    <div>
                      <label className="text-sm text-gray-400">Contact</label>
                      <div className="mt-1 space-y-1">
                        {selectedEmergency.contact_name && (
                          <p className="text-sm flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-400" />
                            {selectedEmergency.contact_name}
                          </p>
                        )}
                        {selectedEmergency.contact_phone && (
                          <p className="text-sm flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-400" />
                            {selectedEmergency.contact_phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  <div>
                    <label className="text-sm text-gray-400">Services Required</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedEmergency.analysis.services.map(service => {
                        const Icon = service === 'police' ? Shield : service === 'ambulance' ? Ambulance : Flame;
                        const colors = SERVICE_COLORS[service as keyof typeof SERVICE_COLORS];
                        return (
                          <Badge key={service} className={`${colors.bg}/20 ${colors.text} ${colors.border}`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {service}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <label className="text-sm text-gray-400">Update Status</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {STATUS_WORKFLOW.map(status => (
                        <Button
                          key={status}
                          variant={selectedEmergency.status === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateStatus(selectedEmergency.id, status)}
                          className={selectedEmergency.status === status ? 'bg-green-600' : 'border-white/20'}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* AI Message */}
                  <div>
                    <label className="text-sm text-gray-400">AI Generated Message</label>
                    <pre className="mt-1 p-3 bg-black/30 rounded-lg text-xs text-gray-300 overflow-auto max-h-40">
                      {selectedEmergency.emergency_message}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-white/10 border-dashed">
                <CardContent className="p-8 text-center text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an emergency to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <Card className="border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${color} opacity-50`} />
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceCard({ service, count, icon: Icon, color }: { service: string; count: number; icon: React.ElementType; color: string }) {
  return (
    <Card className="border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">{service}</p>
            <p className="text-xl font-bold">{count}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
