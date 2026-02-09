import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { ChatMessage } from '@/types';

interface ChatbotProps {
  onReportEmergency: () => void;
}

const QUICK_ACTIONS = [
  { label: 'Report Emergency', icon: '🔴', action: 'report' },
  { label: 'First Aid Help', icon: '🏥', action: 'first aid' },
  { label: 'Check Status', icon: '🔍', action: 'status' },
  { label: 'Emergency Numbers', icon: '📞', action: 'numbers' },
];

const FIRST_AID_TOPICS = [
  { label: 'CPR', response: 'CPR Steps:\n1. Call emergency services\n2. Push hard and fast in center of chest (100-120/min)\n3. Continue until help arrives\n4. If trained, give rescue breaths' },
  { label: 'Bleeding', response: 'For bleeding:\n1. Apply direct pressure with clean cloth\n2. Elevate the wound above heart level\n3. If severe, call emergency services immediately\n4. Do not remove embedded objects' },
  { label: 'Burns', response: 'For burns:\n1. Cool with running water for 20 minutes\n2. Do NOT apply ice, butter, or creams\n3. Cover with clean, non-stick cloth\n4. Seek medical attention for severe burns' },
  { label: 'Choking', response: 'For choking:\n1. Encourage coughing if they can breathe\n2. If cannot breathe, perform back blows\n3. Then abdominal thrusts (Heimlich)\n4. Call emergency services' },
];

export default function Chatbot({ onReportEmergency }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m EmergencyAI Assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Check for first aid topics first
      const firstAidTopic = FIRST_AID_TOPICS.find(t => 
        content.toLowerCase().includes(t.label.toLowerCase())
      );

      if (firstAidTopic) {
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: firstAidTopic.response,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsTyping(false);
        }, 1000);
        return;
      }

      // Check for quick actions
      if (content.toLowerCase().includes('report') || content.toLowerCase().includes('emergency')) {
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: 'I can help you report an emergency. Click the "Report Emergency" button below or type your emergency details.',
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsTyping(false);
        }, 800);
        return;
      }

      if (content.toLowerCase().includes('number') || content.toLowerCase().includes('contact')) {
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: 'Emergency Numbers:\n🚔 Police: 100\n🚑 Ambulance: 108\n🚒 Fire: 101\n\nSave these numbers in your phone!',
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsTyping(false);
        }, 800);
        return;
      }

      // Use API for other queries
      const response = await apiService.sendChatbotMessage(content);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting. For emergencies, please call your local emergency number immediately.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'report':
        onReportEmergency();
        setIsOpen(false);
        break;
      case 'first aid':
        sendMessage('What first aid help do you need?');
        break;
      case 'status':
        sendMessage('How do I check my emergency status?');
        break;
      case 'numbers':
        sendMessage('What are the emergency numbers?');
        break;
      default:
        sendMessage(action);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 rotate-90' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-110 animate-bounce-slow'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl animate-scale-in">
          <CardHeader className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-semibold">EmergencyAI Assistant</span>
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </div>
                </div>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages */}
            <ScrollArea className="h-80 px-4" ref={scrollRef}>
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-red-500'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                        message.role === 'user'
                          ? 'bg-red-500 text-white rounded-br-none'
                          : 'bg-white/10 text-gray-200 rounded-bl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {showQuickActions && (
              <div className="px-4 py-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Quick Actions</span>
                  <button
                    onClick={() => setShowQuickActions(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.action)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs transition-colors"
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showQuickActions && (
              <button
                onClick={() => setShowQuickActions(true)}
                className="w-full py-1 flex items-center justify-center text-gray-400 hover:text-white border-t border-white/10"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/5 border-white/10"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
