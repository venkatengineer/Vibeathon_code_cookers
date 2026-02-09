import { useState, useRef, useEffect } from 'react';
import './App.css';
import Hero from './sections/Hero';
import EmergencyForm from './sections/EmergencyForm';
import AIAnalysis from './sections/AIAnalysis';
import StatusTracker from './sections/StatusTracker';
import ResponderDashboard from './sections/ResponderDashboard';
import RecordsViewer from './sections/RecordsViewer';
import Chatbot from './sections/Chatbot';
import Features from './sections/Features';
import Footer from './sections/Footer';
import type { Emergency } from './types';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowUp, Shield, FileText, LayoutDashboard } from 'lucide-react';

function App() {
  const [submittedEmergency, setSubmittedEmergency] = useState<Emergency | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportClick = () => {
    setSubmittedEmergency(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDashboardClick = () => {
    setShowDashboard(true);
  };

  const handleRecordsClick = () => {
    setShowRecords(true);
  };

  const handleEmergencySubmitted = (emergency: Emergency) => {
    setSubmittedEmergency(emergency);
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(239, 68, 68, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)
            `,
          }}
        />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-glow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                EmergencyAI
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecordsClick}
                className="hidden md:flex border-white/20 hover:bg-white/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Records
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDashboardClick}
                className="hidden md:flex border-white/20 hover:bg-white/10"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                size="sm"
                onClick={handleReportClick}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-glow"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <div className="pt-20">
          <Hero 
            onReportClick={handleReportClick}
            onDashboardClick={handleDashboardClick}
            onRecordsClick={handleRecordsClick}
          />
        </div>

        {/* Emergency Form Section */}
        <div ref={formRef} id="report">
          {!submittedEmergency ? (
            <EmergencyForm onEmergencySubmitted={handleEmergencySubmitted} />
          ) : (
            <div ref={analysisRef}>
              <AIAnalysis emergency={submittedEmergency} />
            </div>
          )}
        </div>

        {/* Status Tracker */}
        {submittedEmergency && (
          <div ref={statusRef}>
            <StatusTracker emergency={submittedEmergency} />
          </div>
        )}

        {/* Features Section */}
        <Features />

        {/* Footer */}
        <Footer />
      </main>

      {/* Responder Dashboard Modal */}
      <ResponderDashboard 
        isOpen={showDashboard} 
        onClose={() => setShowDashboard(false)} 
      />

      {/* Records Viewer Modal */}
      <RecordsViewer 
        isOpen={showRecords} 
        onClose={() => setShowRecords(false)} 
      />

      {/* Chatbot */}
      <Chatbot onReportEmergency={handleReportClick} />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 left-6 z-40 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all animate-scale-in"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Emergency Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-r from-red-600/90 via-red-700/90 to-red-600/90 backdrop-blur-xl border-t border-red-500/50 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-sm">
          <span className="font-semibold">Emergency Numbers:</span>
          <span className="flex items-center gap-1">
            <span className="font-bold">100</span>
            <span className="opacity-75">Police</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-bold">108</span>
            <span className="opacity-75">Ambulance</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-bold">101</span>
            <span className="opacity-75">Fire</span>
          </span>
        </div>
      </div>

      {/* Bottom Spacing for Banner */}
      <div className="h-10" />
    </div>
  );
}

export default App;
