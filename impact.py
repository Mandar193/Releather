import sys
import json
import urllib.request
import os

def check_impact(title, api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = f"You are a sustainability expert. Calculate and explain the environmental impact of reselling or recycling a '{title}' instead of it going to a landfill. Mention specific metrics: approximate liters of water saved and kilograms of CO2 emissions avoided. Format as a concise, professional statement under 2 sentences."
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
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
            if 'candidates' in res_data and len(res_data['candidates']) > 0:
                text = res_data['candidates'][0]['content']['parts'][0]['text']
                return text.strip()
            else:
                return "Positive environmental impact through circularity."
    except Exception as e:
        return f"Impact tracking error: {str(e)}"

if __name__ == "__main__":
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("API key missing")
        sys.exit(1)

    title = sys.stdin.read().strip() or "leather item"
    print(check_impact(title, api_key))
