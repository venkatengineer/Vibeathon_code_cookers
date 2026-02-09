import requests
import json
from datetime import datetime, UTC

GEMINI_API_KEY = "AIzaSyAU_9G8GoixA3EAk8wUBB0Kt9vE7Q01qUQ"

ALLOWED_CATEGORIES = ["Police", "Ambulance", "FireStation"]
ALLOWED_SEVERITY = ["Low", "Medium", "High", "Critical"]


def classify_emergency(text: str) -> dict:

    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

    prompt = f"""
You are an emergency classification AI.

Your task:

1. Classify into ONE category:
Police, Ambulance, or FireStation.

2. Classify severity into:
Low, Medium, High, or Critical.

3. Improve and summarize the message clearly and professionally.

STRICT RULES:
- Output ONLY valid JSON.
- No explanations.
- No markdown.
- Always choose from defined categories.
- Even if irrelevant, force classification.

Format EXACTLY like this:

{{
  "category": "Police | Ambulance | FireStation",
  "severity": "Low | Medium | High | Critical",
  "message": "Improved summarized message"
}}

Message:
{text}
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0,
            "response_mime_type": "application/json"
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        result = response.json()

        raw_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()

        # Clean possible markdown formatting
        if raw_text.startswith("```"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        # Extract only JSON part safely
        start = raw_text.find("{")
        end = raw_text.rfind("}") + 1
        raw_text = raw_text[start:end]

        data = json.loads(raw_text)

        # Validate category
        if data.get("category") not in ALLOWED_CATEGORIES:
            data["category"] = "Police"

        # Validate severity
        if data.get("severity") not in ALLOWED_SEVERITY:
            data["severity"] = "Low"

        # Ensure message exists
        if not data.get("message"):
            data["message"] = "Emergency reported. Further details required."

        # Add timestamp (date + time only)
        data["timestamp"] = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S")

        return data

    except Exception as e:
        print("ERROR:", e)

        return {
            "category": "Police",
            "severity": "Low",
            "message": text,
            "timestamp": datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S")
        }


# Example usage
if __name__ == "__main__":
    test_message = "There is heavy smoke coming from my neighbor's house!"
    result = classify_emergency(test_message)
    print("niceeeee e:",result)
