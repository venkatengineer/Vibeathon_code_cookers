import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Ambulance, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Brain,
  Zap,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Emergency } from '@/types';
import { SEVERITY_COLORS, SERVICE_COLORS } from '@/types';

interface AIAnalysisProps {
  emergency: Emergency;
}

export default function AIAnalysis({ emergency }: AIAnalysisProps) {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showFullMessage, setShowFullMessage] = useState(false);

  useEffect(() => {
    // Animate confidence score
    const interval = setInterval(() => {
      setAnimatedConfidence(prev => {
        if (prev >= emergency.analysis.confidence) {
          clearInterval(interval);
          return emergency.analysis.confidence;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [emergency.analysis.confidence]);

  const copyMessage = () => {
    navigator.clipboard.writeText(emergency.emergency_message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'police': return Shield;
      case 'ambulance': return Ambulance;
      case 'fire': return Flame;
      default: return AlertTriangle;
    }
  };

  const severityConfig = SEVERITY_COLORS[emergency.analysis.severity];

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
              Emergency Reported Successfully
            </span>
          </h2>
          <p className="text-gray-400">
            Emergency ID: <span className="text-white font-mono">{emergency.id}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {emergency.timestamp}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Classification Card */}
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-xl border-white/10 animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                AI Classification Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Services Required */}
              <div>
                <Label text="Services Required" />
                <div className="flex flex-wrap gap-3 mt-2">
                  {emergency.analysis.services.map((service, index) => {
                    const Icon = getServiceIcon(service);
                    const colors = SERVICE_COLORS[service as keyof typeof SERVICE_COLORS];
                    return (
                      <div 
                        key={service}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl ${colors.bg}/20 border ${colors.border} animate-scale-in`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                        <span className={`font-semibold capitalize ${colors.text}`}>
                          {service}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Severity Level */}
              <div>
                <Label text="Severity Assessment" />
                <div className={`mt-2 p-4 rounded-xl ${severityConfig.bg} ${severityConfig.animation}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`w-6 h-6 ${emergency.analysis.severity === 'Medium' ? 'text-black' : 'text-white'}`} />
                      <span className={`text-2xl font-bold ${emergency.analysis.severity === 'Medium' ? 'text-black' : 'text-white'}`}>
                        {emergency.analysis.severity}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${emergency.analysis.severity === 'Medium' ? 'border-black/30 text-black' : 'border-white/30 text-white'}`}
                    >
                      Priority Level
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Confidence Score */}
              <div>
                <Label text="AI Confidence" />
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Analysis Accuracy</span>
                    <span className="text-white font-mono">{animatedConfidence}%</span>
                  </div>
                  <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${animatedConfidence}%` }}
                    />
                    <div className="absolute inset-0 bg-shimmer animate-shimmer" 
                      style={{ backgroundSize: '200% 100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Severity Scores Breakdown */}
              <div>
                <Label text="Service Priority Scores" />
                <div className="mt-2 space-y-3">
                  {Object.entries(emergency.analysis.severity_scores)
                    .filter(([_, score]) => score > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([service, score], index) => {
                      const colors = SERVICE_COLORS[service as keyof typeof SERVICE_COLORS];
                      const percentage = (score / 4) * 100;
                      return (
                        <div key={service} className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                          <span className="w-24 text-sm capitalize text-gray-400">{service}</span>
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${colors.bg} rounded-full transition-all duration-1000`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-12 text-sm text-right text-gray-400">{score}/4</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Response Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatItem 
                icon={Clock}
                label="Estimated Response"
                value={emergency.analysis.severity === 'Critical' ? '< 5 min' : 
                       emergency.analysis.severity === 'High' ? '< 10 min' : 
                       emergency.analysis.severity === 'Medium' ? '< 20 min' : '< 30 min'}
                color="text-green-400"
              />
              <StatItem 
                icon={Shield}
                label="Teams Notified"
                value={`${emergency.analysis.services.length}`}
                color="text-blue-400"
              />
              <StatItem 
                icon={Brain}
                label="Analysis Time"
                value="< 2 seconds"
                color="text-purple-400"
              />
              <StatItem 
                icon={CheckCircle2}
                label="Status"
                value={emergency.status}
                color="text-green-400"
              />
            </CardContent>
          </Card>
        </div>

        {/* Generated Message */}
        <Card className="mt-6 bg-card/50 backdrop-blur-xl border-white/10 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              AI-Generated Emergency Alert
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={copyMessage}
              className="border-white/20 hover:bg-white/10"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className={`p-4 bg-black/30 rounded-lg text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto ${!showFullMessage && 'max-h-48 overflow-hidden'}`}>
                {emergency.emergency_message}
              </pre>
              {!showFullMessage && emergency.emergency_message.length > 300 && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
              )}
            </div>
            {emergency.emergency_message.length > 300 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullMessage(!showFullMessage)}
                className="mt-2 text-gray-400 hover:text-white"
              >
                {showFullMessage ? 'Show Less' : 'Show Full Message'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Label({ text }: { text: string }) {
  return (
    <label className="text-sm font-medium text-gray-400">{text}</label>
  );
}

function StatItem({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}
