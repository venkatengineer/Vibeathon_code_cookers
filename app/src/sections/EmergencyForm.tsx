import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Camera, 
  Video, 
  MapPin, 
  Send, 
  X,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { Emergency, EmergencyAnalysis } from '@/types';

interface EmergencyFormProps {
  onEmergencySubmitted: (emergency: Emergency) => void;
}

export default function EmergencyForm({ onEmergencySubmitted }: EmergencyFormProps) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  
  const [liveAnalysis, setLiveAnalysis] = useState<EmergencyAnalysis | null>(null);
  const [analysisTimeout, setAnalysisTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Live AI analysis as user types
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    
    // Clear previous timeout
    if (analysisTimeout) {
      clearTimeout(analysisTimeout);
    }
    
    // Debounce analysis
    if (value.length > 10) {
      const timeout = setTimeout(async () => {
        try {
          const response = await apiService.analyzeText(value);
          if (response.success) {
            setLiveAnalysis(response.analysis);
          }
        } catch (error) {
          console.error('Analysis error:', error);
        }
      }, 1000);
      setAnalysisTimeout(timeout);
    } else {
      setLiveAnalysis(null);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Location error:', error);
          setLocation('Location access denied');
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocation('Geolocation not supported');
      setIsGettingLocation(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const response = await apiService.transcribeVoice(audioBlob);
          if (response.success) {
            setDescription((prev) => prev + ' ' + response.transcription);
          }
        } catch (error) {
          console.error('Transcription error:', error);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // File handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    setImages(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('video/'));
    
    setVideos(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setVideoPreviews(prev => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      alert('Please provide a description of the emergency');
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setSubmitProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('location', location);
      formData.append('coordinates', JSON.stringify(coordinates));
      formData.append('contactName', contactName);
      formData.append('contactPhone', contactPhone);
      
      images.forEach(image => {
        formData.append('images', image);
      });
      
      videos.forEach(video => {
        formData.append('videos', video);
      });

      const response = await apiService.submitEmergency(formData);
      
      clearInterval(progressInterval);
      setSubmitProgress(100);
      
      if (response.success) {
        onEmergencySubmitted(response.emergency);
        // Reset form
        setDescription('');
        setLocation('');
        setCoordinates(null);
        setContactName('');
        setContactPhone('');
        setImages([]);
        setVideos([]);
        setImagePreviews([]);
        setVideoPreviews([]);
        setLiveAnalysis(null);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit emergency. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
              Report an Emergency
            </span>
          </h2>
          <p className="text-gray-400">
            Describe the situation and our AI will instantly analyze and dispatch the right teams
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Emergency Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  What happened? <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    placeholder="Describe the emergency situation in detail..."
                    className="min-h-[120px] bg-background/50 border-white/10 resize-none pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                {isRecording && (
                  <p className="text-sm text-red-400 animate-pulse">Recording... Click to stop</p>
                )}
              </div>

              {/* Live AI Analysis */}
              {liveAnalysis && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 animate-scale-in">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-400">AI Analysis Active</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {liveAnalysis.services.map(service => (
                      <span 
                        key={service}
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          service === 'police' ? 'bg-blue-500/20 text-blue-400' :
                          service === 'ambulance' ? 'bg-red-500/20 text-red-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {service}
                      </span>
                    ))}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      liveAnalysis.severity === 'Critical' ? 'bg-red-600 text-white' :
                      liveAnalysis.severity === 'High' ? 'bg-orange-500 text-white' :
                      liveAnalysis.severity === 'Medium' ? 'bg-yellow-500 text-black' :
                      'bg-blue-500 text-white'
                    }`}>
                      {liveAnalysis.severity} Severity
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-400">
                      {liveAnalysis.confidence}% confidence
                    </span>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter address or use current location"
                    className="flex-1 bg-background/50 border-white/10"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="border-white/20 hover:bg-white/10"
                  >
                    {isGettingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {coordinates && (
                  <p className="text-sm text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Location captured successfully
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Your Name</Label>
                  <Input
                    id="contactName"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="bg-background/50 border-white/10"
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <Label>Supporting Evidence</Label>
                
                {/* Image Upload */}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-white/20 hover:bg-white/10"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Add Photos
                  </Button>
                  
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
                    className="flex-1 border-white/20 hover:bg-white/10"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Add Videos
                  </Button>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Video Previews */}
                {videoPreviews.length > 0 && (
                  <div className="space-y-2">
                    {videoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <video
                          src={preview}
                          controls
                          className="w-full max-h-48 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-6 text-lg font-semibold rounded-xl shadow-glow disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Emergency Report
                  </>
                )}
              </Button>

              {/* Progress Bar */}
              {isSubmitting && (
                <div className="space-y-2">
                  <Progress value={submitProgress} className="h-2" />
                  <p className="text-center text-sm text-gray-400">
                    {submitProgress < 30 ? 'Analyzing emergency...' :
                     submitProgress < 60 ? 'Uploading evidence...' :
                     submitProgress < 90 ? 'Generating alert...' :
                     'Finalizing...'}
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
