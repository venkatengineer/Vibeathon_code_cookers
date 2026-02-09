import { 
  Shield, 
  Heart, 
  Github, 
  Twitter, 
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react';

const emergencyNumbers = [
  { number: '100', label: 'Police', color: 'text-blue-400' },
  { number: '108', label: 'Ambulance', color: 'text-red-400' },
  { number: '101', label: 'Fire', color: 'text-orange-400' },
  { number: '112', label: 'Universal', color: 'text-green-400' },
];

const quickLinks = [
  { label: 'Report Emergency', href: '#report' },
  { label: 'Check Status', href: '#status' },
  { label: 'Responder Dashboard', href: '#dashboard' },
  { label: 'First Aid Guide', href: '#firstaid' },
];

const resources = [
  { label: 'Documentation', href: '#' },
  { label: 'API Reference', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative bg-black/50 border-t border-white/10">
      {/* Emergency Numbers Banner */}
      <div className="bg-gradient-to-r from-red-600/20 via-orange-600/20 to-red-600/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <span className="text-sm font-medium text-gray-400">Emergency Numbers:</span>
            {emergencyNumbers.map((item) => (
              <div key={item.number} className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${item.color}`}>{item.number}</span>
                <span className="text-sm text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">EmergencyAI</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              AI-powered emergency response system that saves lives through instant classification, 
              smart dispatch, and real-time tracking.
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Github className="w-5 h-5 text-gray-400" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Twitter className="w-5 h-5 text-gray-400" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Mail className="w-5 h-5 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-red-500" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-500" />
              Resources
            </h4>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-500" />
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                support@emergencyai.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4" />
                +1 (800) 911-HELP
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  123 Emergency Response Center<br />
                  Tech City, TC 12345
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2026 EmergencyAI. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for Vibe-a-Thon 2026
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
