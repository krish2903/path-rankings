import os, re, requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("NORRY_API_KEY")
url = "https://api.perplexity.ai/chat/completions"

def extract_json_object(text):
    text = re.sub(r'^`{3,}\w*\s*', '', text)
    text = re.sub(r'`{3,}\s*$', '', text)

    start = text.find('{')
    if start == -1:
        return None  

    depth = 0
    for i in range(start, len(text)):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                json_str = text[start:end]
                return json_str
    return None  

def get_country_info(country: str):
    prompt = f'''You are Nori, an expert assistant for international students with a personal and friendly nature/tone.

For the given country, return a JSON array with exactly 6 cards. Each card should have these fields:

- "headline": An interesting title that highlights the main news or update, written to be exciting for international students (positive or negative - it has to be valuable and applicable to international students).
- "category": Choose from: government policies, career opportunities, financial benefits, student hacks, travel destinations, life quality, campus news, visa updates or cost of living, make it specifically relevant to international students. Only use categories specific to international student concerns.
- "description": 1-2 sentences summarizing the update or tip in a compelling, concise way—a bit with the key facts and important points highlighted (no irrelevant or extra data - just to-the-point news).

Only include news or updates directly relevant to international students and their decision-making before arrival, such as visa/news rules, major tuition changes, post-study work, scholarships, student life, etc. 
Make sure the news or update is the most recent and applicable to international students thinking about pursuing higher education abroad.
Use only information from 2025. Search for latest {country} international student updates. Do not invent data.

Return ONLY the JSON with these 6 cards and nothing else—no extra text.

IMPORTANT: Return as a strict JSON object starting and ending with a curly bracket.
CRITICAL: Even if no 2025 news exists, create exactly 6 cards with current/best general info for {country} international students (visa basics, costs, etc.). 
NEVER return empty cards array. Use real, up-to-date data from 2025 where possible.
Country: {country}
'''

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "sonar",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0
    }

    response = requests.post(url, headers=headers, json=data)
    print(prompt)

    if response.status_code == 200:
        result = response.json()
        print(result)
        reply = result['choices'][0]['message']['content']
        return reply
    else:
        raise Exception(f"Error {response.status_code}: {response.text}")

def get_uni_info(university: str):
    prompt = f'''You are Nori, an expert assistant for international students with a personal and friendly nature/tone.

For the given university, return a JSON array with exactly 6 cards. Each card should have these fields:

- "headline": An interesting, international student-friendly title for the card.
- "category": One of the following (choose the closest one for each card):
  "entry requirements", "language requirements", "tuition fees", "scholarships & funding", "cost of living", "campus life & support", "career opportunities", "student hacks".
- "description": 2-4 sentences, concise but practical, focused on what an INTERNATIONAL STUDENT should know before deciding to study at this university.

Rules:
- Information should be recent, realistic, and based on typical ranges - do NOT invent precise numbers if unsure; instead, give approximate ranges or clearly say "varies by course".
- Focus ONLY on aspects directly useful for an international student.
- If a detail truly cannot be found, you may give a high-level, honest description instead of making up fake data.
Return ONLY the JSON with these 6 cards and nothing else—no extra text.

IMPORTANT: Return as a strict JSON object starting and ending with a curly bracket.
CRITICAL: Even if no 2025 news exists, create exactly 6 cards with current/best general info for {university} international students. 
NEVER return empty cards array. Use real, up-to-date data from 2025 where possible.
University: {university}
'''

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "sonar",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        print(response)
        result = response.json()
        print(result)
        reply = result['choices'][0]['message']['content']
        return reply
    else:
        raise Exception(f"Error {response.status_code}: {response.text}")