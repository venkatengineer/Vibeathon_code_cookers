export interface EmergencyAnalysis {
  services: string[];
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  severity_scores: {
    police: number;
    ambulance: number;
    fire: number;
  };
  confidence: number;
  matched_keywords: string[];
}

export interface EmergencyFile {
  type: 'image' | 'video';
  filename: string;
  original_name: string;
  path: string;
  preview?: string;
}

export interface StatusHistoryItem {
  status: string;
  timestamp: string;
}

export interface Emergency {
  id: string;
  timestamp: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  contact_name?: string;
  contact_phone?: string;
  files: EmergencyFile[];
  analysis: EmergencyAnalysis;
  emergency_message: string;
  status: string;
  status_history: StatusHistoryItem[];
  estimated_arrival?: string;
}

export interface EmergencyFormData {
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  contactName: string;
  contactPhone: string;
  images: File[];
  videos: File[];
}

export interface StatusUpdate {
  current_status: string;
  status_history: StatusHistoryItem[];
  estimated_arrival?: string;
  progress_percentage: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DashboardStats {
  total_emergencies: number;
  active_emergencies: number;
  resolved_emergencies: number;
  service_breakdown: {
    police: number;
    ambulance: number;
    fire: number;
  };
  severity_breakdown: {
    Low: number;
    Medium: number;
    High: number;
    Critical: number;
  };
  average_response_time: string;
}

export const STATUS_WORKFLOW = [
  'Request Received',
  'Preparing',
  'Team Dispatched',
  'On the Way',
  'Action in Progress',
  'Resolved'
] as const;

export type StatusType = typeof STATUS_WORKFLOW[number];

export const SERVICE_COLORS = {
  police: {
    bg: 'bg-blue-500',
    text: 'text-blue-400',
    border: 'border-blue-500',
    glow: 'shadow-glow-blue'
  },
  ambulance: {
    bg: 'bg-red-500',
    text: 'text-red-400',
    border: 'border-red-500',
    glow: 'shadow-glow'
  },
  fire: {
    bg: 'bg-orange-500',
    text: 'text-orange-400',
    border: 'border-orange-500',
    glow: 'shadow-glow-orange'
  }
} as const;

export const SEVERITY_COLORS = {
  Critical: {
    bg: 'bg-red-600',
    text: 'text-red-500',
    border: 'border-red-600',
    glow: 'shadow-glow-lg',
    animation: 'animate-pulse'
  },
  High: {
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    border: 'border-orange-500',
    glow: 'shadow-glow-orange',
    animation: 'animate-pulse-slow'
  },
  Medium: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    border: 'border-yellow-500',
    glow: 'shadow-glow-yellow',
    animation: ''
  },
  Low: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    glow: 'shadow-glow-blue',
    animation: ''
  }
} as const;

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Request Received': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  'Preparing': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  'Team Dispatched': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  'On the Way': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  'Action in Progress': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  'Resolved': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' }
};
