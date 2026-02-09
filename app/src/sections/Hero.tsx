import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Shield, 
  Ambulance, 
  Flame, 
  Phone, 
  ChevronDown,
  Activity,
  Clock,
  MapPin,
  FileText
} from 'lucide-react';

interface HeroProps {
  onReportClick: () => void;
  onDashboardClick: () => void;
  onRecordsClick?: () => void;
}

export default function Hero({ onReportClick, onDashboardClick, onRecordsClick }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] animate-pulse-slow"
        style={{
          transform: `translate(${(mousePosition.x - 0.5) * -50}px, ${(mousePosition.y - 0.5) * -50}px)`,
          transition: 'transform 0.5s ease-out',
        }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-600/20 rounded-full blur-[100px] animate-pulse-slow"
        style={{
          animationDelay: '1s',
          transform: `translate(${(mousePosition.x - 0.5) * 50}px, ${(mousePosition.y - 0.5) * 50}px)`,
          transition: 'transform 0.5s ease-out',
        }}
      />
      <div 
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-600/15 rounded-full blur-[80px] animate-pulse-slow"
        style={{
          animationDelay: '2s',
        }}
      />

      {/* Floating Emergency Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Police Icon */}
        <div 
          className={`absolute top-[15%] left-[10%] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.3s' }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-ping-slow" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-glow-blue animate-float">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Ambulance Icon */}
        <div 
          className={`absolute top-[20%] right-[15%] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.5s' }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-ping-slow" style={{ animationDelay: '0.5s' }} />
            <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-glow animate-float" style={{ animationDelay: '0.5s' }}>
              <Ambulance className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Fire Icon */}
        <div 
          className={`absolute bottom-[25%] left-[15%] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.7s' }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-xl animate-ping-slow" style={{ animationDelay: '1s' }} />
            <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center shadow-glow-orange animate-float" style={{ animationDelay: '1s' }}>
              <Flame className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Alert Icon */}
        <div 
          className={`absolute bottom-[20%] right-[10%] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.9s' }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-xl animate-ping-slow" style={{ animationDelay: '1.5s' }} />
            <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl flex items-center justify-center shadow-glow-yellow animate-float" style={{ animationDelay: '1.5s' }}>
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Siren Light Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2">
        <div className="absolute left-1/4 w-1/4 h-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent animate-siren" />
        <div className="absolute right-1/4 w-1/4 h-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-siren" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Badge */}
        <div 
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <Activity className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-400">Vibe-a-Thon 2026</span>
        </div>

        {/* Main Title */}
        <h1 
          className={`text-5xl md:text-7xl lg:text-8xl font-bold mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.2s' }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-gradient">
            EmergencyAI
          </span>
        </h1>

        {/* Subtitle */}
        <p 
          className={`text-xl md:text-2xl text-gray-400 mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.4s' }}
        >
          Smart Emergency Response System
        </p>

        {/* Description */}
        <p 
          className={`text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.6s' }}
        >
          AI-powered emergency reporting that instantly analyzes situations, classifies severity, 
          and dispatches the right response teams. Every second counts.
        </p>

        {/* Feature Pills */}
        <div 
          className={`flex flex-wrap justify-center gap-3 mb-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.7s' }}
        >
          {[
            { icon: Activity, label: 'AI Analysis' },
            { icon: Clock, label: 'Real-time Tracking' },
            { icon: MapPin, label: 'Live Location' },
            { icon: Phone, label: 'Instant Dispatch' },
          ].map((feature, index) => (
            <div 
              key={feature.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <feature.icon className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div 
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.8s' }}
        >
          <Button 
            size="lg"
            onClick={onReportClick}
            className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 animate-pulse-glow"
          >
            <AlertTriangle className="w-5 h-5 mr-2 group-hover:animate-wiggle" />
            Report Emergency
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            onClick={onDashboardClick}
            className="group border-white/20 hover:bg-white/10 text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300"
          >
            <Shield className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Responder Dashboard
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            onClick={onRecordsClick}
            className="group border-white/20 hover:bg-white/10 text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300"
          >
            <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            View Records
          </Button>
        </div>

        {/* Emergency Numbers */}
        <div 
          className={`mt-12 flex flex-wrap justify-center gap-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '1s' }}
        >
          {[
            { number: '100', label: 'Police', color: 'text-blue-400' },
            { number: '108', label: 'Ambulance', color: 'text-red-400' },
            { number: '101', label: 'Fire', color: 'text-orange-400' },
          ].map((item) => (
            <div key={item.number} className="text-center">
              <div className={`text-2xl font-bold ${item.color}`}>{item.number}</div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <button 
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 hover:text-white transition-colors animate-bounce-slow"
      >
        <ChevronDown className="w-8 h-8" />
      </button>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
