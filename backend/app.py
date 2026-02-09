"""
EmergencyAI Backend - Flask API for Emergency Classification
Vibe-a-Thon 2026 Hackathon Project
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
import json
import re

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Create upload folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In-memory storage for emergencies and status tracking
emergencies_db = {}
status_history = {}

# Emergency classification keywords
EMERGENCY_CATEGORIES = {
    'police': {
        'keywords': [
            'crime', 'robbery', 'theft', 'burglary', 'assault', 'fight', 'violence',
            'gun', 'weapon', 'knife', 'threat', 'harassment', 'stalking', 'kidnap',
            'murder', 'homicide', 'shooting', 'stabbing', 'attack', 'intruder',
            'trespassing', 'vandalism', 'fraud', 'scam', 'drug', 'illegal',
            'suspicious', 'stranger danger', 'domestic violence', 'abuse',
            'car accident', 'hit and run', 'drunk driving', 'traffic violation',
            'riot', 'looting', 'protest violent', 'terrorist', 'bomb'
        ],
        'severity_indicators': {
            'critical': ['murder', 'shooting', 'gun', 'bomb', 'terrorist', 'hostage', 'active shooter'],
            'high': ['robbery', 'assault', 'weapon', 'knife', 'stabbing', 'hit and run'],
            'medium': ['theft', 'burglary', 'fight', 'vandalism', 'fraud'],
            'low': ['suspicious', 'trespassing', 'traffic violation']
        }
    },
    'ambulance': {
        'keywords': [
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
        'severity_indicators': {
            'critical': ['heart attack', 'stroke', 'unconscious', 'not breathing', 'cardiac arrest', 'severe bleeding', 'suicide', 'anaphylaxis'],
            'high': ['chest pain', 'difficulty breathing', 'seizure', 'head injury', 'severe burn', 'poisoning', 'overdose'],
            'medium': ['fracture', 'bleeding', 'allergic reaction', 'asthma attack', 'dehydration'],
            'low': ['minor cut', 'bruise', 'mild pain', 'fever', 'rash']
        }
    },
    'fire': {
        'keywords': [
            'fire', 'flame', 'burning', 'smoke', 'smoky', 'smell smoke',
            'house fire', 'building fire', 'forest fire', 'wildfire', 'car fire',
            'electrical fire', 'kitchen fire', 'gas leak', 'explosion', 'explosive',
            'chemical spill', 'hazardous material', 'toxic', 'radiation',
            'trapped', 'cant get out', 'stuck in building', 'elevator stuck',
            'structural collapse', 'building collapse', 'earthquake', 'flood',
            'tsunami', 'hurricane', 'tornado', 'storm damage', 'power line down',
            'gas smell', 'propane', 'natural gas', 'carbon monoxide'
        ],
        'severity_indicators': {
            'critical': ['building collapse', 'trapped', 'explosion', 'large fire', 'multiple casualties', 'toxic chemical'],
            'high': ['house fire', 'building fire', 'gas leak', 'structural damage', 'electrical fire'],
            'medium': ['car fire', 'kitchen fire', 'small fire', 'smoke', 'elevator stuck'],
            'low': ['smell smoke', 'minor smoke', 'small burn']
        }
    }
}

# Status workflow
STATUS_WORKFLOW = [
    'Request Received',
    'Preparing',
    'Team Dispatched',
    'On the Way',
    'Action in Progress',
    'Resolved'
]


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def analyze_emergency(text_description, has_image=False, has_video=False):
    """
    AI-powered emergency classification and severity analysis
    """
    text_lower = text_description.lower()
    
    # Determine which services are needed
    detected_services = []
    severity_scores = {'police': 0, 'ambulance': 0, 'fire': 0}
    
    for service, data in EMERGENCY_CATEGORIES.items():
        service_keywords = data['keywords']
        severity_indicators = data['severity_indicators']
        
        # Check for keywords
        matched_keywords = [kw for kw in service_keywords if kw in text_lower]
        
        if matched_keywords:
            detected_services.append(service)
            
            # Determine severity for this service
            if any(ind in text_lower for ind in severity_indicators['critical']):
                severity_scores[service] = 4  # Critical
            elif any(ind in text_lower for ind in severity_indicators['high']):
                severity_scores[service] = 3  # High
            elif any(ind in text_lower for ind in severity_indicators['medium']):
                severity_scores[service] = 2  # Medium
            else:
                severity_scores[service] = 1  # Low
    
    # If no specific service detected, default to police for general emergencies
    if not detected_services:
        detected_services = ['police']
        severity_scores['police'] = 1
    
    # Determine overall severity
    max_severity = max(severity_scores.values())
    severity_map = {1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical'}
    overall_severity = severity_map[max_severity]
    
    # Generate confidence score based on keyword matches
    total_keywords = sum(len([kw for kw in EMERGENCY_CATEGORIES[s]['keywords'] if kw in text_lower]) 
                        for s in detected_services)
    confidence = min(95, 50 + total_keywords * 10)
    
    return {
        'services': detected_services,
        'severity': overall_severity,
        'severity_scores': severity_scores,
        'confidence': confidence,
        'matched_keywords': matched_keywords if 'matched_keywords' in locals() else []
    }


def generate_emergency_message(emergency_id, text_description, analysis, location, timestamp):
    """
    Generate a structured message for emergency teams
    """
    services_needed = ', '.join([s.upper() for s in analysis['services']])
    severity = analysis['severity']
    
    message = f"""
🚨 EMERGENCY ALERT - {severity.upper()} PRIORITY 🚨

Emergency ID: {emergency_id}
Timestamp: {timestamp}
Severity Level: {severity}
Services Required: {services_needed}

📍 LOCATION:
{location if location else 'Location not provided - GPS tracking active'}

📝 INCIDENT DETAILS:
{text_description}

🤖 AI ANALYSIS:
- Classification Confidence: {analysis['confidence']}%
- Recommended Response Time: {'< 5 minutes' if severity == 'Critical' else '< 10 minutes' if severity == 'High' else '< 20 minutes' if severity == 'Medium' else '< 30 minutes'}
- Priority Level: {severity}

⚠️ NOTES:
- Please confirm receipt of this alert
- Update status in real-time
- Coordinate with other services if multi-agency response required

Generated by EmergencyAI System
Vibe-a-Thon 2026
    """
    return message.strip()


def create_emergency_record(data, files_info):
    """
    Create a new emergency record in the database
    """
    emergency_id = str(uuid.uuid4())[:8].upper()
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Analyze the emergency
    analysis = analyze_emergency(
        data.get('description', ''),
        has_image=any(f['type'] == 'image' for f in files_info),
        has_video=any(f['type'] == 'video' for f in files_info)
    )
    
    # Generate emergency message
    emergency_message = generate_emergency_message(
        emergency_id,
        data.get('description', ''),
        analysis,
        data.get('location', ''),
        timestamp
    )
    
    # Create emergency record
    emergency_record = {
        'id': emergency_id,
        'timestamp': timestamp,
        'description': data.get('description', ''),
        'location': data.get('location', ''),
        'coordinates': data.get('coordinates', {}),
        'contact_name': data.get('contactName', ''),
        'contact_phone': data.get('contactPhone', ''),
        'files': files_info,
        'analysis': analysis,
        'emergency_message': emergency_message,
        'status': 'Request Received',
        'status_history': [{'status': 'Request Received', 'timestamp': timestamp}],
        'estimated_arrival': None
    }
    
    # Store in database
    emergencies_db[emergency_id] = emergency_record
    
    return emergency_record


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'service': 'EmergencyAI Backend'
    })


@app.route('/api/emergency/submit', methods=['POST'])
def submit_emergency():
    """
    Submit a new emergency report
    Accepts: text description, images, videos, location data
    """
    try:
        # Get form data
        description = request.form.get('description', '')
        location = request.form.get('location', '')
        coordinates = request.form.get('coordinates', '{}')
        contact_name = request.form.get('contactName', '')
        contact_phone = request.form.get('contactPhone', '')
        
        # Parse coordinates
        try:
            coordinates = json.loads(coordinates)
        except:
            coordinates = {}
        
        # Process uploaded files
        files_info = []
        
        # Handle images
        if 'images' in request.files:
            images = request.files.getlist('images')
            for image in images:
                if image and image.filename and allowed_file(image.filename):
                    filename = secure_filename(f"{uuid.uuid4()}_{image.filename}")
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    image.save(filepath)
                    files_info.append({
                        'type': 'image',
                        'filename': filename,
                        'original_name': image.filename,
                        'path': filepath
                    })
        
        # Handle videos
        if 'videos' in request.files:
            videos = request.files.getlist('videos')
            for video in videos:
                if video and video.filename and allowed_file(video.filename):
                    filename = secure_filename(f"{uuid.uuid4()}_{video.filename}")
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    video.save(filepath)
                    files_info.append({
                        'type': 'video',
                        'filename': filename,
                        'original_name': video.filename,
                        'path': filepath
                    })
        
        # Create emergency data dictionary
        emergency_data = {
            'description': description,
            'location': location,
            'coordinates': coordinates,
            'contactName': contact_name,
            'contactPhone': contact_phone
        }
        
        # Create emergency record
        emergency_record = create_emergency_record(emergency_data, files_info)
        
        return jsonify({
            'success': True,
            'message': 'Emergency report submitted successfully',
            'emergency': {
                'id': emergency_record['id'],
                'timestamp': emergency_record['timestamp'],
                'analysis': emergency_record['analysis'],
                'emergency_message': emergency_record['emergency_message'],
                'status': emergency_record['status']
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to submit emergency report'
        }), 500


@app.route('/api/emergency/<emergency_id>', methods=['GET'])
def get_emergency(emergency_id):
    """Get emergency details by ID"""
    if emergency_id not in emergencies_db:
        return jsonify({
            'success': False,
            'error': 'Emergency not found'
        }), 404
    
    return jsonify({
        'success': True,
        'emergency': emergencies_db[emergency_id]
    })


@app.route('/api/emergency/<emergency_id>/status', methods=['GET'])
def get_emergency_status(emergency_id):
    """Get current status of an emergency"""
    if emergency_id not in emergencies_db:
        return jsonify({
            'success': False,
            'error': 'Emergency not found'
        }), 404
    
    emergency = emergencies_db[emergency_id]
    
    return jsonify({
        'success': True,
        'status': {
            'current_status': emergency['status'],
            'status_history': emergency['status_history'],
            'estimated_arrival': emergency['estimated_arrival'],
            'progress_percentage': (STATUS_WORKFLOW.index(emergency['status']) + 1) / len(STATUS_WORKFLOW) * 100
        }
    })


@app.route('/api/emergency/<emergency_id>/status', methods=['PUT'])
def update_emergency_status(emergency_id):
    """Update emergency status (for responder dashboard)"""
    if emergency_id not in emergencies_db:
        return jsonify({
            'success': False,
            'error': 'Emergency not found'
        }), 404
    
    data = request.get_json()
    new_status = data.get('status')
    estimated_arrival = data.get('estimatedArrival')
    
    if new_status not in STATUS_WORKFLOW:
        return jsonify({
            'success': False,
            'error': f'Invalid status. Must be one of: {", ".join(STATUS_WORKFLOW)}'
        }), 400
    
    emergency = emergencies_db[emergency_id]
    emergency['status'] = new_status
    emergency['status_history'].append({
        'status': new_status,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    
    if estimated_arrival:
        emergency['estimated_arrival'] = estimated_arrival
    
    return jsonify({
        'success': True,
        'message': 'Status updated successfully',
        'status': {
            'current_status': emergency['status'],
            'status_history': emergency['status_history'],
            'progress_percentage': (STATUS_WORKFLOW.index(emergency['status']) + 1) / len(STATUS_WORKFLOW) * 100
        }
    })


@app.route('/api/emergencies', methods=['GET'])
def get_all_emergencies():
    """Get all emergencies (for responder dashboard)"""
    status_filter = request.args.get('status')
    service_filter = request.args.get('service')
    
    emergencies = list(emergencies_db.values())
    
    # Apply filters
    if status_filter:
        emergencies = [e for e in emergencies if e['status'] == status_filter]
    
    if service_filter:
        emergencies = [e for e in emergencies if service_filter in e['analysis']['services']]
    
    # Sort by timestamp (newest first)
    emergencies.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return jsonify({
        'success': True,
        'count': len(emergencies),
        'emergencies': emergencies
    })


@app.route('/api/emergency/<emergency_id>/message', methods=['GET'])
def get_emergency_message(emergency_id):
    """Get the AI-generated emergency message"""
    if emergency_id not in emergencies_db:
        return jsonify({
            'success': False,
            'error': 'Emergency not found'
        }), 404
    
    return jsonify({
        'success': True,
        'message': emergencies_db[emergency_id]['emergency_message']
    })


@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    """Analyze text description without creating an emergency record"""
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({
            'success': False,
            'error': 'No text provided'
        }), 400
    
    analysis = analyze_emergency(text)
    
    return jsonify({
        'success': True,
        'analysis': analysis
    })


@app.route('/api/voice/transcribe', methods=['POST'])
def transcribe_voice():
    """Simulate voice transcription (would integrate with speech-to-text API in production)"""
    if 'audio' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No audio file provided'
        }), 400
    
    audio_file = request.files['audio']
    
    # In production, this would use Google Speech-to-Text, AWS Transcribe, etc.
    # For demo purposes, we'll return a simulated response
    
    return jsonify({
        'success': True,
        'transcription': 'Voice transcription would appear here. This is a simulated response for the demo.',
        'confidence': 0.95,
        'language': 'en-US'
    })


@app.route('/api/chatbot/message', methods=['POST'])
def chatbot_message():
    """Chatbot assistance endpoint"""
    data = request.get_json()
    message = data.get('message', '').lower()
    
    # Simple rule-based chatbot responses
    responses = {
        'help': "I'm here to help! You can:\n1. Report an emergency\n2. Check emergency status\n3. Get first aid instructions\n4. Contact emergency services",
        'first aid': "For first aid instructions, please specify the situation (burns, cuts, choking, etc.)",
        'burn': "For burns: Cool the burn with cool running water for 20 minutes. Do not apply ice, butter, or creams. Cover with a clean cloth. Seek medical attention for severe burns.",
        'bleeding': "For bleeding: Apply direct pressure with a clean cloth. Elevate the wound if possible. If severe, call emergency services immediately.",
        'choking': "For choking: Encourage coughing if they can. If not, perform back blows and abdominal thrusts (Heimlich maneuver). Call emergency services.",
        'cpr': "For CPR: Call emergency services first. Push hard and fast in the center of the chest (100-120 compressions per minute). Continue until help arrives.",
        'status': "To check your emergency status, please provide your emergency ID.",
        'hello': "Hello! I'm EmergencyAI Assistant. How can I help you today?",
        'hi': "Hi there! I'm here to assist with emergencies. What do you need help with?",
        'emergency': "If you have an emergency, please click the 'Report Emergency' button or call your local emergency number immediately!"
    }
    
    # Find matching response
    response = responses.get('help')  # Default response
    for keyword, resp in responses.items():
        if keyword in message:
            response = resp
            break
    
    return jsonify({
        'success': True,
        'response': response,
        'suggestions': ['Report Emergency', 'First Aid Help', 'Check Status', 'Contact Info']
    })


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    total_emergencies = len(emergencies_db)
    active_emergencies = sum(1 for e in emergencies_db.values() if e['status'] != 'Resolved')
    resolved_emergencies = sum(1 for e in emergencies_db.values() if e['status'] == 'Resolved')
    
    # Count by service
    service_counts = {'police': 0, 'ambulance': 0, 'fire': 0}
    for e in emergencies_db.values():
        for service in e['analysis']['services']:
            if service in service_counts:
                service_counts[service] += 1
    
    # Count by severity
    severity_counts = {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0}
    for e in emergencies_db.values():
        severity = e['analysis']['severity']
        if severity in severity_counts:
            severity_counts[severity] += 1
    
    return jsonify({
        'success': True,
        'stats': {
            'total_emergencies': total_emergencies,
            'active_emergencies': active_emergencies,
            'resolved_emergencies': resolved_emergencies,
            'service_breakdown': service_counts,
            'severity_breakdown': severity_counts,
            'average_response_time': '8.5 minutes'  # Simulated
        }
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
