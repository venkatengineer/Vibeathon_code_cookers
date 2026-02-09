import type { Emergency, EmergencyAnalysis, StatusUpdate, DashboardStats } from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

// Demo mode - works without backend
const DEMO_MODE = true;

// In-memory storage for demo
let demoEmergencies: Emergency[] = [];
let demoIdCounter = 1;

// Emergency classification keywords (same as backend)
const EMERGENCY_CATEGORIES = {
  police: {
    keywords: [
      'crime', 'robbery', 'theft', 'burglary', 'assault', 'fight', 'violence',
      'gun', 'weapon', 'knife', 'threat', 'harassment', 'stalking', 'kidnap',
      'murder', 'homicide', 'shooting', 'stabbing', 'attack', 'intruder',
      'trespassing', 'vandalism', 'fraud', 'scam', 'drug', 'illegal',
      'suspicious', 'stranger danger', 'domestic violence', 'abuse',
      'car accident', 'hit and run', 'drunk driving', 'traffic violation',
      'riot', 'looting', 'protest violent', 'terrorist', 'bomb'
    ],
    severity_indicators: {
      critical: ['murder', 'shooting', 'gun', 'bomb', 'terrorist', 'hostage', 'active shooter'],
      high: ['robbery', 'assault', 'weapon', 'knife', 'stabbing', 'hit and run'],
      medium: ['theft', 'burglary', 'fight', 'vandalism', 'fraud'],
      low: ['suspicious', 'trespassing', 'traffic violation']
    }
  },
  ambulance: {
    keywords: [
      'medical', 'health', 'injury', 'injured', 'bleeding', 'wound', 'pain',
      'chest pain', 'heart attack', 'stroke', 'seizure', 'unconscious',
      'fainted', 'fainting', 'breathing', 'cant breathe', 'difficulty breathing',
      'allergic reaction', 'anaphylaxis', 'poisoning', 'overdose', 'burn',
      'fracture', 'broken bone', 'head injury', 'concussion', 'bleeding',
      'pregnant', 'labor', 'baby coming', 'childbirth', 'suicide',
      'mental health crisis', 'panic attack', 'anxiety attack', 'diabetic',
      'asthma attack', 'choking', 'drowning', 'electrocution', 'shock',
      'dehydration', 'heat stroke', 'hypothermia', 'allergy', 'rash'
    ],
    severity_indicators: {
      critical: ['heart attack', 'stroke', 'unconscious', 'not breathing', 'cardiac arrest', 'severe bleeding', 'suicide', 'anaphylaxis'],
      high: ['chest pain', 'difficulty breathing', 'seizure', 'head injury', 'severe burn', 'poisoning', 'overdose'],
      medium: ['fracture', 'bleeding', 'allergic reaction', 'asthma attack', 'dehydration'],
      low: ['minor cut', 'bruise', 'mild pain', 'fever', 'rash']
    }
  },
  fire: {
    keywords: [
      'fire', 'flame', 'burning', 'smoke', 'smoky', 'smell smoke',
      'house fire', 'building fire', 'forest fire', 'wildfire', 'car fire',
      'electrical fire', 'kitchen fire', 'gas leak', 'explosion', 'explosive',
      'chemical spill', 'hazardous material', 'toxic', 'radiation',
      'trapped', 'cant get out', 'stuck in building', 'elevator stuck',
      'structural collapse', 'building collapse', 'earthquake', 'flood',
      'tsunami', 'hurricane', 'tornado', 'storm damage', 'power line down',
      'gas smell', 'propane', 'natural gas', 'carbon monoxide'
    ],
    severity_indicators: {
      critical: ['building collapse', 'trapped', 'explosion', 'large fire', 'multiple casualties', 'toxic chemical'],
      high: ['house fire', 'building fire', 'gas leak', 'structural damage', 'electrical fire'],
      medium: ['car fire', 'kitchen fire', 'small fire', 'smoke', 'elevator stuck'],
      low: ['smell smoke', 'minor smoke', 'small burn']
    }
  }
};

const STATUS_WORKFLOW = [
  'Request Received',
  'Preparing',
  'Team Dispatched',
  'On the Way',
  'Action in Progress',
  'Resolved'
];

function analyzeEmergencyText(text: string): EmergencyAnalysis {
  const textLower = text.toLowerCase();
  
  const detectedServices: string[] = [];
  const severityScores: {police: number; ambulance: number; fire: number} = {police: 0, ambulance: 0, fire: 0};
  
  for (const [service, data] of Object.entries(EMERGENCY_CATEGORIES)) {
    const matchedKeywords = data.keywords.filter(kw => textLower.includes(kw));
    
    if (matchedKeywords.length > 0) {
      detectedServices.push(service);
      
      if (data.severity_indicators.critical.some(ind => textLower.includes(ind))) {
        severityScores[service as keyof typeof severityScores] = 4;
      } else if (data.severity_indicators.high.some(ind => textLower.includes(ind))) {
        severityScores[service as keyof typeof severityScores] = 3;
      } else if (data.severity_indicators.medium.some(ind => textLower.includes(ind))) {
        severityScores[service as keyof typeof severityScores] = 2;
      } else {
        severityScores[service as keyof typeof severityScores] = 1;
      }
    }
  }
  
  if (detectedServices.length === 0) {
    detectedServices.push('police');
    severityScores.police = 1;
  }
  
  const maxSeverity = Math.max(...Object.values(severityScores));
  const severityMap: { [key: number]: 'Low' | 'Medium' | 'High' | 'Critical' } = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Critical'
  };
  
  const totalKeywords = detectedServices.reduce((sum, service) => {
    return sum + EMERGENCY_CATEGORIES[service as keyof typeof EMERGENCY_CATEGORIES].keywords
      .filter(kw => textLower.includes(kw)).length;
  }, 0);
  
  return {
    services: detectedServices,
    severity: severityMap[maxSeverity],
    severity_scores: severityScores,
    confidence: Math.min(95, 50 + totalKeywords * 10),
    matched_keywords: []
  };
}

function generateEmergencyMessage(emergency: Emergency): string {
  const servicesNeeded = emergency.analysis.services.map(s => s.toUpperCase()).join(', ');
  
  return `
🚨 EMERGENCY ALERT - ${emergency.analysis.severity.toUpperCase()} PRIORITY 🚨

Emergency ID: ${emergency.id}
Timestamp: ${emergency.timestamp}
Severity Level: ${emergency.analysis.severity}
Services Required: ${servicesNeeded}

📍 LOCATION:
${emergency.location || 'Location not provided'}

📝 INCIDENT DETAILS:
${emergency.description}

🤖 AI ANALYSIS:
- Classification Confidence: ${emergency.analysis.confidence}%
- Recommended Response Time: ${emergency.analysis.severity === 'Critical' ? '< 5 minutes' : 
    emergency.analysis.severity === 'High' ? '< 10 minutes' : 
    emergency.analysis.severity === 'Medium' ? '< 20 minutes' : '< 30 minutes'}
- Priority Level: ${emergency.analysis.severity}

⚠️ NOTES:
- Please confirm receipt of this alert
- Update status in real-time
- Coordinate with other services if multi-agency response required

Generated by EmergencyAI System
Vibe-a-Thon 2026
  `.trim();
}

class ApiService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // DEMO MODE FUNCTIONS
  private demoSubmitEmergency(formData: FormData): { success: boolean; emergency: Emergency; message: string } {
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const contactName = formData.get('contactName') as string;
    const contactPhone = formData.get('contactPhone') as string;
    
    const analysis = analyzeEmergencyText(description);
    
    const emergency: Emergency = {
      id: `EM${String(demoIdCounter++).padStart(4, '0')}`,
      timestamp: new Date().toLocaleString(),
      description,
      location,
      contact_name: contactName,
      contact_phone: contactPhone,
      files: [],
      analysis,
      emergency_message: '',
      status: 'Request Received',
      status_history: [{ status: 'Request Received', timestamp: new Date().toLocaleString() }]
    };
    
    emergency.emergency_message = generateEmergencyMessage(emergency);
    demoEmergencies.unshift(emergency);
    
    return {
      success: true,
      message: 'Emergency report submitted successfully',
      emergency
    };
  }

  private demoAnalyzeText(text: string): { success: boolean; analysis: EmergencyAnalysis } {
    return {
      success: true,
      analysis: analyzeEmergencyText(text)
    };
  }

  private demoGetEmergencies(): { success: boolean; emergencies: Emergency[]; count: number } {
    return {
      success: true,
      emergencies: demoEmergencies,
      count: demoEmergencies.length
    };
  }

  private demoGetStats(): { success: boolean; stats: DashboardStats } {
    const total = demoEmergencies.length;
    const resolved = demoEmergencies.filter(e => e.status === 'Resolved').length;
    
    return {
      success: true,
      stats: {
        total_emergencies: total,
        active_emergencies: total - resolved,
        resolved_emergencies: resolved,
        service_breakdown: {
          police: demoEmergencies.filter(e => e.analysis.services.includes('police')).length,
          ambulance: demoEmergencies.filter(e => e.analysis.services.includes('ambulance')).length,
          fire: demoEmergencies.filter(e => e.analysis.services.includes('fire')).length
        },
        severity_breakdown: {
          Low: demoEmergencies.filter(e => e.analysis.severity === 'Low').length,
          Medium: demoEmergencies.filter(e => e.analysis.severity === 'Medium').length,
          High: demoEmergencies.filter(e => e.analysis.severity === 'High').length,
          Critical: demoEmergencies.filter(e => e.analysis.severity === 'Critical').length
        },
        average_response_time: '8.5 minutes'
      }
    };
  }

  private demoUpdateStatus(emergencyId: string, newStatus: string): { success: boolean; status: StatusUpdate } {
    const emergency = demoEmergencies.find(e => e.id === emergencyId);
    if (emergency) {
      emergency.status = newStatus;
      emergency.status_history.push({
        status: newStatus,
        timestamp: new Date().toLocaleString()
      });
    }
    
    return {
      success: true,
      status: {
        current_status: newStatus,
        status_history: emergency?.status_history || [],
        progress_percentage: (STATUS_WORKFLOW.indexOf(newStatus as any) + 1) / STATUS_WORKFLOW.length * 100
      }
    };
  }

  private demoGetStatus(emergencyId: string): { success: boolean; status: StatusUpdate } {
    const emergency = demoEmergencies.find(e => e.id === emergencyId);
    
    return {
      success: true,
      status: {
        current_status: emergency?.status || 'Request Received',
        status_history: emergency?.status_history || [],
        progress_percentage: (STATUS_WORKFLOW.indexOf((emergency?.status || 'Request Received') as any) + 1) / STATUS_WORKFLOW.length * 100
      }
    };
  }

  private demoChatbot(message: string): { success: boolean; response: string; suggestions: string[] } {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('first aid') || lowerMsg.includes('cpr') || lowerMsg.includes('bleeding')) {
      return {
        success: true,
        response: 'First Aid Quick Guide:\n\n🩹 BLEEDING:\n- Apply direct pressure\n- Elevate the wound\n- Call emergency if severe\n\n❤️ CPR:\n- Call 108 first\n- Push hard & fast (100-120/min)\n- 30 compressions : 2 breaths\n\n🔥 BURNS:\n- Cool with water 20 min\n- No ice/butter\n- Cover with clean cloth',
        suggestions: ['Report Emergency', 'CPR Steps', 'Burn Treatment']
      };
    }
    
    if (lowerMsg.includes('number') || lowerMsg.includes('contact') || lowerMsg.includes('phone')) {
      return {
        success: true,
        response: '📞 Emergency Numbers:\n\n🚔 Police: 100\n🚑 Ambulance: 108\n🚒 Fire: 101\n🌐 Universal: 112\n\nSave these in your phone!',
        suggestions: ['Report Emergency', 'First Aid Help', 'Check Status']
      };
    }
    
    if (lowerMsg.includes('status') || lowerMsg.includes('track')) {
      return {
        success: true,
        response: 'To check your emergency status, please provide your Emergency ID (e.g., EM0001). You can also view all records in the Responder Dashboard.',
        suggestions: ['View Dashboard', 'Report Emergency', 'First Aid Help']
      };
    }
    
    return {
      success: true,
      response: 'I can help you with:\n\n1. 🚨 Report an emergency\n2. 🩹 First aid guidance\n3. 📞 Emergency numbers\n4. 🔍 Check emergency status\n\nWhat do you need help with?',
      suggestions: ['Report Emergency', 'First Aid Help', 'Emergency Numbers']
    };
  }

  // API METHODS
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    if (DEMO_MODE) {
      return { status: 'healthy (demo)', timestamp: new Date().toISOString(), version: '1.0.0-demo' };
    }
    return this.fetchWithErrorHandling(`${API_BASE_URL}/health`);
  }

  async submitEmergency(formData: FormData): Promise<{ success: boolean; emergency: Emergency; message: string }> {
    if (DEMO_MODE) {
      return this.demoSubmitEmergency(formData);
    }
    return this.fetchWithErrorHandling(`${API_BASE_URL}/emergency/submit`, {
      method: 'POST',
      body: formData,
    });
  }

  async getEmergency(emergencyId: string): Promise<{ success: boolean; emergency: Emergency }> {
    if (DEMO_MODE) {
      const emergency = demoEmergencies.find(e => e.id === emergencyId);
      return { success: !!emergency, emergency: emergency! };
    }
    return this.fetchWithErrorHandling(`${API_BASE_URL}/emergency/${emergencyId}`);
  }

  async getEmergencyStatus(emergencyId: string): Promise<{ success: boolean; status: StatusUpdate }> {
    if (DEMO_MODE) {
      return this.demoGetStatus(emergencyId);
    }
    return this.fetchWithErrorHandling(`${API_BASE_URL}/emergency/${emergencyId}/status`);
  }

  async updateEmergencyStatus(
    emergencyId: string, 
    status: string, 
    estimatedArrival?: string
  ): Promise<{ success: boolean; status: StatusUpdate }> {
    if (DEMO_MODE) {
      return this.demoUpdateStatus(emergencyId, status);
    }
    return this.fetchWithErrorHandling(`${API_BASE_URL}/emergency/${emergencyId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, estimatedArrival }),
    });
  }

  async getAllEmergencies(filters?: { status?: string; service?: string }): Promise<{ success: boolean; emergencies: Emergency[]; count: number }> {
    if (DEMO_MODE) {
      const result = this.demoGetEmergencies();
      let emergencies = result.emergencies;
      
      if (filters?.status) {
        emergencies = emergencies.filter(e => e.status === filters.status);
      }
      if (filters?.service) {
        emergencies = emergencies.filter(e => e.analysis.services.includes(filters.service!));
      }
      
      return { ...result, emergencies, count: emergencies.length };
    }
    
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.service) params.append('service', filters.service);
    
    return this.fetchWithErrorHandling(`${API_BASE_URL}/emergencies?${params.toString()}`);
  }

  async getEmergencyMessage(emergencyId: string): Promise<{ success: boolean; message: string }> {
    if (DEMO_MODE) {
      const emergency = demoEmergencies.find(e => e.id === emergencyId);
      return { success: !!emergency, message: emergency?.emergency_message || '' };
    }
    return this.fetchWithErrorHandling(`${API_BASE_URL}/emergency/${emergencyId}/message`);
  }

  async analyzeText(text: string): Promise<{ success: boolean; analysis: EmergencyAnalysis }> {
    if (DEMO_MODE) {
      return this.demoAnalyzeText(text);
    }
    return this.fetchWithErrorHandling(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  }

  async transcribeVoice(audioBlob: Blob): Promise<{ success: boolean; transcription: string; confidence: number }> {
    if (DEMO_MODE) {
      return { success: true, transcription: 'Voice transcription demo mode - please type your emergency.', confidence: 0.95 };
    }
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    return this.fetchWithErrorHandling(`${API_BASE_URL}/voice/transcribe`, {
      method: 'POST',
      body: formData,
    });
  }

  async sendChatbotMessage(message: string): Promise<{ success: boolean; response: string; suggestions: string[] }> {
    if (DEMO_MODE) {
      return this.demoChatbot(message);
    }
    return this.fetchWithErrorHandling(`${API_BASE_URL}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  }

  async getStats(): Promise<{ success: boolean; stats: DashboardStats }> {
    if (DEMO_MODE) {
      return this.demoGetStats();
    }
    return this.fetchWithErrorHandling(`${API_BASE_URL}/stats`);
  }

  // Get all demo emergencies (for records view)
  getDemoEmergencies(): Emergency[] {
    return demoEmergencies;
  }
}

export const apiService = new ApiService();
export default apiService;
