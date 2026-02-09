import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  Activity,
  CheckCheck,
  RotateCcw,
  Radio,
  Navigation
} from 'lucide-react';
import type { Emergency } from '@/types';
import { STATUS_WORKFLOW, STATUS_COLORS } from '@/types';
import { apiService } from '@/services/api';

interface StatusTrackerProps {
  emergency: Emergency;
}

interface StatusUpdate {
  current_status: string;
  status_history: { status: string; timestamp: string }[];
  estimated_arrival?: string;
  progress_percentage: number;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  'Request Received': CheckCircle2,
  'Preparing': Clock,
  'Team Dispatched': Truck,
  'On the Way': Navigation,
  'Action in Progress': Activity,
  'Resolved': CheckCheck,
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  'Request Received': 'Your emergency report has been received and is being processed.',
  'Preparing': 'Emergency teams are being briefed and equipped for response.',
  'Team Dispatched': 'Response teams have been dispatched to your location.',
  'On the Way': 'Teams are en route. Stay calm and ensure access is available.',
  'Action in Progress': 'Emergency teams are on site addressing the situation.',
  'Resolved': 'The emergency has been resolved. Thank you for reporting.',
};

export default function StatusTracker({ emergency }: StatusTrackerProps) {
  const [status, setStatus] = useState<StatusUpdate>({
    current_status: emergency.status,
    status_history: emergency.status_history,
    estimated_arrival: emergency.estimated_arrival,
    progress_percentage: (STATUS_WORKFLOW.indexOf(emergency.status as any) + 1) / STATUS_WORKFLOW.length * 100,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);

  // Poll for status updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await apiService.getEmergencyStatus(emergency.id);
        if (response.success) {
          const newStatus = response.status;
          if (newStatus.current_status !== status.current_status) {
            setPulseEffect(true);
            setTimeout(() => setPulseEffect(false), 1000);
          }
          setStatus(newStatus);
        }
      } catch (error) {
        console.error('Status poll error:', error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [emergency.id, status.current_status]);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const response = await apiService.getEmergencyStatus(emergency.id);
      if (response.success) {
        setStatus(response.status);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const currentStatusIndex = STATUS_WORKFLOW.indexOf(status.current_status as any);

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Live Status Tracker
            </span>
          </h2>
          <p className="text-gray-400">
            Track your emergency response in real-time
          </p>
        </div>

        <Card className={`bg-card/50 backdrop-blur-xl border-white/10 transition-all duration-300 ${pulseEffect ? 'shadow-glow-blue scale-[1.02]' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-green-500 animate-pulse" />
              Emergency Status
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStatus}
              disabled={isRefreshing}
              className="border-white/20 hover:bg-white/10"
            >
              <RotateCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Current Status Banner */}
            <div className={`p-6 rounded-xl ${STATUS_COLORS[status.current_status]?.bg || 'bg-gray-500/20'} border ${STATUS_COLORS[status.current_status]?.border || 'border-gray-500/50'} text-center`}>
              <div className="flex items-center justify-center gap-3 mb-2">
                {(() => {
                  const Icon = STATUS_ICONS[status.current_status] || Activity;
                  return <Icon className={`w-8 h-8 ${STATUS_COLORS[status.current_status]?.text || 'text-gray-400'}`} />;
                })()}
                <span className={`text-2xl font-bold ${STATUS_COLORS[status.current_status]?.text || 'text-gray-400'}`}>
                  {status.current_status}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                {STATUS_DESCRIPTIONS[status.current_status]}
              </p>
              {status.estimated_arrival && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">
                    ETA: {status.estimated_arrival}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Response Progress</span>
                <span className="text-white font-mono">{Math.round(status.progress_percentage)}%</span>
              </div>
              <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-1000"
                  style={{ width: `${status.progress_percentage}%` }}
                >
                  <div className="absolute inset-0 bg-shimmer animate-shimmer" 
                    style={{ backgroundSize: '200% 100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />
              
              <div className="space-y-4">
                {STATUS_WORKFLOW.map((step, index) => {
                  const isCompleted = index < currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = STATUS_ICONS[step] || Activity;
                  
                  const historyItem = status.status_history.find(h => h.status === step);
                  
                  return (
                    <div 
                      key={step}
                      className={`relative flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${
                        isCurrent ? 'bg-white/10 shadow-glow-blue' : 
                        isCompleted ? 'bg-white/5' : 'opacity-50'
                      }`}
                    >
                      {/* Status Icon */}
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-blue-500 text-white animate-pulse' :
                        'bg-white/10 text-gray-500'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      {/* Status Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold ${
                            isCurrent ? 'text-white' :
                            isCompleted ? 'text-green-400' :
                            'text-gray-500'
                          }`}>
                            {step}
                          </h4>
                          {historyItem && (
                            <span className="text-xs text-gray-500">
                              {historyItem.timestamp}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {STATUS_DESCRIPTIONS[step]}
                        </p>
                      </div>
                      
                      {/* Status Indicator */}
                      {isCompleted && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                      {isCurrent && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live updates every 5 seconds</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
