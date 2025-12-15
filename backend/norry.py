import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("NORRY_API_KEY")
URL = "https://api.perplexity.ai/chat/completions"
SEARCH_URL = "https://api.perplexity.ai/search"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

def enrich_citations(urls: list[str]) -> list[dict]:
    if not urls:
        return []

    enriched = []

    for url in urls:
        try:
            payload = {
                "query": url,
                "max_results": 1,
                "max_tokens_per_page": 256,
            }

            resp = requests.post(
                SEARCH_URL,
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

            results = data.get("results", [])
            if not results:
                enriched.append({
                    "url": url,
                    "title": None,
                    "date": None,
                })
                continue

            top = results[0]
            enriched.append({
                "url": url,
                "title": top.get("title"),
                "date": top.get("date"),
            })
        except Exception as e:
            print(f"⚠️ Failed to enrich citation {url}: {e}")
            enriched.append({
                "url": url,
                "title": None,
                "date": None,
                "snippet": None,
            })

    return enriched

def get_country_info(country: str):
    schema = {
        "type": "object",
        "properties": {
            "cards": {
                "type": "array",
                "minItems": 6,
                "maxItems": 6,
                "items": {
                    "type": "object",
                    "properties": {
                        "headline": {"type": "string"},
                        "category": {"type": "string"},
                        "description": {"type": "string"},
                    },
                    "required": ["headline", "category", "description"],
                    "additionalProperties": False,
                },
            },
        },
        "required": ["cards"],
        "additionalProperties": False,
    }

    prompt = f"""
You are Nori, an expert assistant for international students with a personal and friendly tone.

For the given country, return JSON with exactly 6 cards in a top-level "cards" array.
Each card must have:
- "headline": An interesting title for international students.
- "category": One of government policies, career opportunities, financial benefits, student hacks,
  travel destinations, life quality, campus news, visa updates, or cost of living, and it must be
  relevant to international students.
- "description": 1-2 sentences summarizing the update or tip, concise and practical.

Use only information that is relevant to international students and prefer 2025 information
(e.g. visa rules, post-study work, scholarships, cost of living, etc.).
Include the source used in the description as [1][2] etc.
If recent 2025 news is limited, fall back to solid general guidance, but still produce 6 useful cards.
Do not invent precise numbers if unsure; use ranges or qualitative descriptions.

Country: {country}
"""

    data = {
        "model": "sonar",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0,
        "return_citations": True,
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "nori_country_cards",
                "schema": schema,
                "strict": True,
            },
        },
    }

    resp = requests.post(URL, headers=HEADERS, json=data)
    resp.raise_for_status()
    res_json = resp.json()

    content_str = res_json["choices"][0]["message"]["content"]
    cards_obj = json.loads(content_str)  

    citations = res_json.get("citations", [])  
    citations = enrich_citations(citations)

    return cards_obj, citations

def get_uni_info(university: str):
    schema = {
        "type": "object",
        "properties": {
            "cards": {
                "type": "array",
                "minItems": 6,
                "maxItems": 6,
                "items": {
                    "type": "object",
                    "properties": {
                        "headline": {"type": "string"},
                        "category": {"type": "string"},
                        "description": {"type": "string"},
                    },
                    "required": ["headline", "category", "description"],
                    "additionalProperties": False,
                },
            },
        },
        "required": ["cards"],
        "additionalProperties": False,
    }

    prompt = f"""
You are Nori, an expert assistant for international students with a personal and friendly tone.

For the given university, return JSON with exactly 6 cards in a top-level "cards" array.
Each card must have:
- "headline": An international student-friendly title.
- "category": One of:
  "entry requirements", "language requirements", "tuition fees",
  "scholarships & funding", "cost of living", "campus life & support",
  "career opportunities", "student hacks".
- "description": 2-4 sentences, concise but practical, focused on what an international student
  should know before deciding to study at this university.

Information should be recent and realistic.
Include the source used in the description as [1][2] etc.
Use typical ranges or qualitative descriptions if exact numbers are uncertain
(e.g. “varies by course”, “typically between X and Y per year”).
Focus only on aspects directly useful for international students.
If a detail truly cannot be found, provide an honest high-level description instead of fabricating data.

Prefer information from 2025 where available, but always return 6 useful cards.

University: {university}
"""

    data = {
        "model": "sonar",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0,
        "return_citations": True,
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "nori_university_cards",
                "schema": schema,
                "strict": True,
            },
        },
    }

    resp = requests.post(URL, headers=HEADERS, json=data)
    resp.raise_for_status()
    res_json = resp.json()

    content_str = res_json["choices"][0]["message"]["content"]
    cards_obj = json.loads(content_str)

    citations = res_json.get("citations", [])
    citations = enrich_citations(citations)

    return cards_obj, citations