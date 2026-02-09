import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  FileText,
  Eye,
  X
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { Emergency } from '@/types';
import { SERVICE_COLORS, SEVERITY_COLORS, STATUS_COLORS } from '@/types';

interface RecordsViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecordsViewer({ isOpen, onClose }: RecordsViewerProps) {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAllEmergencies();
      if (response.success) {
        setEmergencies(response.emergencies);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      // Fallback to demo data
      setEmergencies(apiService.getDemoEmergencies());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecords();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'police': return Shield;
      case 'ambulance': return Ambulance;
      case 'fire': return Flame;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-auto">
      <div className="min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-500" />
              Emergency Records
            </h2>
            <p className="text-gray-400 mt-1">View all submitted emergency reports</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchRecords}
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
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Reports" value={emergencies.length} color="text-blue-400" />
          <StatCard 
            title="Critical" 
            value={emergencies.filter(e => e.analysis.severity === 'Critical').length} 
            color="text-red-400" 
          />
          <StatCard 
            title="Active" 
            value={emergencies.filter(e => e.status !== 'Resolved').length} 
            color="text-yellow-400" 
          />
          <StatCard 
            title="Resolved" 
            value={emergencies.filter(e => e.status === 'Resolved').length} 
            color="text-green-400" 
          />
        </div>

        {/* Records List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              All Records ({emergencies.length})
            </h3>
            
            {emergencies.length === 0 ? (
              <Card className="border-white/10 border-dashed">
                <CardContent className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No emergency records yet</p>
                  <p className="text-sm mt-2">Submit an emergency report to see it here</p>
                </CardContent>
              </Card>
            ) : (
              emergencies.map((emergency) => (
                <Card 
                  key={emergency.id}
                  className={`cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedEmergency?.id === emergency.id ? 'border-green-500 shadow-glow-green' : 'border-white/10'
                  }`}
                  onClick={() => setSelectedEmergency(emergency)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-gray-400">#{emergency.id}</span>
                          <Badge className={`${SEVERITY_COLORS[emergency.analysis.severity].bg} text-white text-xs`}>
                            {emergency.analysis.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2 mb-2">{emergency.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {emergency.timestamp}
                          </span>
                          {emergency.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {emergency.location.slice(0, 30)}...
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        {emergency.analysis.services.map(service => {
                          const Icon = getServiceIcon(service);
                          const colors = SERVICE_COLORS[service as keyof typeof SERVICE_COLORS];
                          return (
                            <Icon key={service} className={`w-4 h-4 ${colors.text}`} />
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${STATUS_COLORS[emergency.status]?.text} ${STATUS_COLORS[emergency.status]?.border}`}
                      >
                        {emergency.status}
                      </Badge>
                      <Eye className="w-4 h-4 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Detail View */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Record Details
            </h3>
            
            {selectedEmergency ? (
              <Card className="border-white/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">#{selectedEmergency.id}</CardTitle>
                    <Badge className={`${SEVERITY_COLORS[selectedEmergency.analysis.severity].bg} text-white`}>
                      {selectedEmergency.analysis.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Analysis */}
                  <div className="p-3 rounded-lg bg-white/5">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">AI Classification</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmergency.analysis.services.map(service => {
                        const Icon = getServiceIcon(service);
                        const colors = SERVICE_COLORS[service as keyof typeof SERVICE_COLORS];
                        return (
                          <div key={service} className={`flex items-center gap-1 px-2 py-1 rounded ${colors.bg}/20`}>
                            <Icon className={`w-3 h-3 ${colors.text}`} />
                            <span className={`text-xs capitalize ${colors.text}`}>{service}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Confidence: {selectedEmergency.analysis.confidence}%
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                    <p className="text-sm">{selectedEmergency.description}</p>
                  </div>

                  {/* Location */}
                  {selectedEmergency.location && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Location</h4>
                      <p className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-400" />
                        {selectedEmergency.location}
                      </p>
                    </div>
                  )}

                  {/* Contact */}
                  {(selectedEmergency.contact_name || selectedEmergency.contact_phone) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Contact</h4>
                      <div className="space-y-1">
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

                  {/* Status */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Current Status</h4>
                    <Badge 
                      variant="outline" 
                      className={`${STATUS_COLORS[selectedEmergency.status]?.text} ${STATUS_COLORS[selectedEmergency.status]?.border}`}
                    >
                      {selectedEmergency.status}
                    </Badge>
                  </div>

                  {/* AI Message */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Generated Alert Message</h4>
                    <pre className="p-3 bg-black/30 rounded-lg text-xs text-gray-300 overflow-auto max-h-48 whitespace-pre-wrap">
                      {selectedEmergency.emergency_message}
                    </pre>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-white/10">
                    Submitted: {selectedEmergency.timestamp}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-white/10 border-dashed">
                <CardContent className="p-8 text-center text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a record to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <Card className="border-white/10">
      <CardContent className="p-4">
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
