import { useEffect, useRef, useState } from 'react';
import { 
  Brain, 
  Zap, 
  Shield, 
  MapPin, 
  Mic, 
  Globe, 
  Activity,
  Clock,
  Bell,
  Users,
  MessageSquare,
  Radio,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms instantly classify emergencies and determine severity levels with high accuracy.',
    color: 'from-purple-500 to-pink-500',
    glow: 'shadow-glow-purple',
  },
  {
    icon: Zap,
    title: 'Instant Dispatch',
    description: 'Automatically generates structured alerts and forwards them to the appropriate emergency services within seconds.',
    color: 'from-yellow-500 to-orange-500',
    glow: 'shadow-glow-orange',
  },
  {
    icon: Shield,
    title: 'Multi-Service Coordination',
    description: 'Seamlessly coordinates between Police, Ambulance, and Fire services for comprehensive emergency response.',
    color: 'from-blue-500 to-cyan-500',
    glow: 'shadow-glow-blue',
  },
  {
    icon: MapPin,
    title: 'Live Location Sharing',
    description: 'Real-time GPS tracking ensures emergency teams can find you quickly, even without a specific address.',
    color: 'from-green-500 to-emerald-500',
    glow: 'shadow-glow-green',
  },
  {
    icon: Mic,
    title: 'Voice Input Support',
    description: 'Report emergencies hands-free using voice commands, perfect for situations where typing is difficult.',
    color: 'from-red-500 to-pink-500',
    glow: 'shadow-glow',
  },
  {
    icon: Globe,
    title: 'Multi-Language Ready',
    description: 'Built to support multiple languages, making emergency reporting accessible to everyone.',
    color: 'from-indigo-500 to-purple-500',
    glow: 'shadow-glow-purple',
  },
  {
    icon: Activity,
    title: 'Real-Time Tracking',
    description: 'Track the status of your emergency report from submission to resolution with live updates.',
    color: 'from-cyan-500 to-blue-500',
    glow: 'shadow-glow-blue',
  },
  {
    icon: Bell,
    title: 'Priority Notifications',
    description: 'Smart notification system ensures critical emergencies get immediate attention from responders.',
    color: 'from-orange-500 to-red-500',
    glow: 'shadow-glow-orange',
  },
  {
    icon: Users,
    title: 'Responder Dashboard',
    description: 'Comprehensive dashboard for emergency responders to manage and coordinate multiple incidents.',
    color: 'from-violet-500 to-purple-500',
    glow: 'shadow-glow-purple',
  },
  {
    icon: MessageSquare,
    title: 'AI Chatbot Assistant',
    description: '24/7 chatbot support provides first aid guidance and helps users navigate the emergency reporting process.',
    color: 'from-pink-500 to-rose-500',
    glow: 'shadow-glow',
  },
  {
    icon: Clock,
    title: 'Timestamped Records',
    description: 'Every emergency report includes precise timestamps for accurate record-keeping and analysis.',
    color: 'from-amber-500 to-yellow-500',
    glow: 'shadow-glow-yellow',
  },
  {
    icon: Radio,
    title: 'Live Status Updates',
    description: 'Receive continuous updates as your emergency progresses through each response stage.',
    color: 'from-teal-500 to-cyan-500',
    glow: 'shadow-glow-blue',
  },
];

export default function Features() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-400">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Everything You Need
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            EmergencyAI combines cutting-edge technology with intuitive design to deliver the ultimate emergency response experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => {
            const isVisible = visibleItems.has(index);
            return (
              <div
                key={feature.title}
                ref={(el) => { itemRefs.current[index] = el; }}
                data-index={index}
                className={`group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(index % 3) * 100}ms` }}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`} />
                
                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${feature.glow}`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
              </div>
            );
          })}
        </div>

        {/* How AI Classification Works */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                How AI Classification Works
              </span>
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our intelligent system analyzes your emergency description and automatically determines the right response
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <h4 className="text-lg font-semibold text-blue-400 mt-2 mb-3">Keyword Analysis</h4>
              <p className="text-sm text-gray-400 mb-4">
                The system scans your description for emergency-related keywords:
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>🚔 <strong>Police:</strong> crime, robbery, assault, accident</li>
                <li>🚑 <strong>Ambulance:</strong> injury, bleeding, heart attack</li>
                <li>🚒 <strong>Fire:</strong> fire, smoke, gas leak, trapped</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <h4 className="text-lg font-semibold text-purple-400 mt-2 mb-3">Severity Assessment</h4>
              <p className="text-sm text-gray-400 mb-4">
                Based on detected keywords, severity is determined:
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>🔴 <strong>Critical:</strong> Life-threatening (shooting, cardiac arrest)</li>
                <li>🟠 <strong>High:</strong> Serious emergency (assault, severe injury)</li>
                <li>🟡 <strong>Medium:</strong> Moderate concern (theft, minor injury)</li>
                <li>🔵 <strong>Low:</strong> Minor incident (suspicious activity)</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <h4 className="text-lg font-semibold text-green-400 mt-2 mb-3">Instant Dispatch</h4>
              <p className="text-sm text-gray-400 mb-4">
                The system automatically:
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>✅ Classifies emergency type (Police/Ambulance/Fire)</li>
                <li>✅ Assigns priority level</li>
                <li>✅ Generates structured alert message</li>
                <li>✅ Notifies appropriate services</li>
                <li>✅ Creates trackable record</li>
              </ul>
            </div>
          </div>

          {/* Example */}
          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Example Classification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">Input:</p>
                <p className="p-3 bg-black/30 rounded-lg text-sm text-gray-300 italic">
                  "There's a car accident on Main Street. Someone is bleeding heavily and unconscious."
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">AI Output:</p>
                <div className="p-3 bg-black/30 rounded-lg text-sm space-y-1">
                  <p><span className="text-blue-400">🚔 Police:</span> <span className="text-green-400">✓</span> (car accident)</p>
                  <p><span className="text-red-400">🚑 Ambulance:</span> <span className="text-green-400">✓</span> (bleeding, unconscious)</p>
                  <p><span className="text-orange-400">🚒 Fire:</span> <span className="text-gray-500">✗</span></p>
                  <p><span className="text-red-500 font-semibold">Severity:</span> Critical</p>
                  <p><span className="text-purple-400">Confidence:</span> 92%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
