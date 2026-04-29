import sys
import json
import base64
import urllib.request
import os

def analyze_image(image_base64, api_key):
    # Remove header if present
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = "Analyze this leather product photo. Return ONLY JSON with fields: condition (New/Excellent/Good/Fair/Poor), suggestedPrice (number), confidence (0.0-1.0), and notes (observations)."
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inlineData": {
                            "mimeType": "image/jpeg",
                            "data": image_base64
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            
            # Extract content text
            if 'candidates' in res_data and len(res_data['candidates']) > 0:
                text = res_data['candidates'][0]['content']['parts'][0]['text']
                # Sometimes it comes wrapped in markdown
                if '```json' in text:
                    text = text.split('```json')[1].split('```')[0].strip()
                elif '```' in text:
                    text = text.split('```')[1].split('```')[0].strip()
                return text
            else:
                return json.dumps({"error": "No candidates found"})
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input provided"}))
        sys.exit(1)
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print(json.dumps({"error": "GEMINI_API_KEY not set"}))
        sys.exit(1)

    # Read from stdin for large base64 strings
    input_data = sys.stdin.read()
    print(analyze_image(input_data, api_key))
