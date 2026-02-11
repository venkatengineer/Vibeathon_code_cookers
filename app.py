import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory
import requests
import json
from datetime import datetime, UTC
from flask import send_from_directory


app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "uploads"

os.makedirs("uploads", exist_ok=True)

GEMINI_API_KEY = "apikeyhere"

ALLOWED_CATEGORIES = ["Police", "Ambulance", "FireStation"]
ALLOWED_SEVERITY = ["Low", "Medium", "High", "Critical"]


# ---------------- DATABASE ---------------- #

def init_db():
    conn = sqlite3.connect("complaints.db")
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS Police (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        message TEXT,
        severity TEXT,
        timestamp TEXT,
        image TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS FireStation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        message TEXT,
        severity TEXT,
        timestamp TEXT,
        image TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS Ambulance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        message TEXT,
        severity TEXT,
        timestamp TEXT,
        image TEXT
    )
    """)

    conn.commit()
    conn.close()

init_db()

@app.route("/")
def home():
    return send_from_directory(".", "complaint.html")
@app.route("/police")
def police_page():
    return send_from_directory(".", "police.html")

@app.route("/firestation")
def firestation_page():
    return send_from_directory(".", "firestation.html")

@app.route("/ambulance")
def ambulance_page():
    return send_from_directory(".", "ambulance.html")

# ---------------- AI FUNCTION ---------------- #

def classify_emergency(text: str) -> dict:

    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

    prompt = f"""
You are an emergency classification AI.

Classify into ONE category:
Police, Ambulance, FireStation.

Classify severity:
Low, Medium, High, Critical.

Return ONLY JSON:
{{
  "category": "...",
  "severity": "...",
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
            "temperature": 0
        }
    }

    try:
        response = requests.post(url, json=payload, timeout=10)

        if response.status_code != 200:
            print("Gemini HTTP Error:", response.text)
            raise Exception("Gemini API HTTP error")

        result = response.json()

        if "candidates" not in result:
            print("Gemini API Error:", result)
            raise Exception("Gemini logical error")

        raw_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()

        # Clean markdown if Gemini adds it
        if raw_text.startswith("```"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        # Extract JSON safely
        start = raw_text.find("{")
        end = raw_text.rfind("}") + 1
        raw_text = raw_text[start:end]

        data = json.loads(raw_text)

        if data.get("category") not in ALLOWED_CATEGORIES:
            data["category"] = "Police"

        if data.get("severity") not in ALLOWED_SEVERITY:
            data["severity"] = "Low"

        if not data.get("message"):
            data["message"] = text

        data["timestamp"] = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S")

        return data

    except Exception as e:
        print("AI FAILURE:", e)

        return {
            "category": "Police",
            "severity": "Low",
            "message": text,
            "timestamp": datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S")
        }



# ---------------- ROUTES ---------------- #

@app.route("/file-complaint", methods=["POST"])
def file_complaint():
    title = request.form.get("title")
    description = request.form.get("description")
    image = request.files.get("image")

    image_path = None
    if image:
        image_path = os.path.join(app.config["UPLOAD_FOLDER"], image.filename)
        image.save(image_path)

    ai_result = classify_emergency(description)

    conn = sqlite3.connect("complaints.db")
    c = conn.cursor()

    table = ai_result["category"]

    c.execute(f"""
    INSERT INTO {table} (title, description, message, severity, timestamp, image)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        title,
        description,
        ai_result["message"],
        ai_result["severity"],
        ai_result["timestamp"],
        image.filename if image else None
    ))

    conn.commit()
    conn.close()

    return jsonify({"status": "Complaint filed successfully"})


@app.route("/get/<category>")
def get_complaints(category):
    if category not in ALLOWED_CATEGORIES:
        return jsonify([])

    conn = sqlite3.connect("complaints.db")
    c = conn.cursor()

    c.execute(f"SELECT * FROM {category}")
    rows = c.fetchall()
    conn.close()

    result = []
    for r in rows:
        image_url = None
        if r[6]:  # if image exists
            image_url = f"http://127.0.0.1:5000/uploads/{r[6]}"

        result.append({
            "id": r[0],
            "title": r[1],
            "description": r[2],
            "message": r[3],
            "severity": r[4],
            "timestamp": r[5],
            "image": image_url
        })

    return jsonify(result)



@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


if __name__ == "__main__":
    app.run(debug=True)

