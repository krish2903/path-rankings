import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("NORRY_API_KEY")  

url = "https://api.perplexity.ai/chat/completions"

def get_info(country: str):
    prompt = f"""Give me the latest information that is relevant to prospective international students planning to study in {country}. 
Focus on updates or news that would impact their decision-making process before they arrive — such as changes to visa rules, tuition fees, cost of living, post-study work rights, safety conditions, or immigration pathways. 
If there are no updates in some areas, skip them. 
Keep it short and precise. Do not include any citations including numbers like [1][2]. Just provide the information.
Additionally, give 2-3 reasons why {country} is best country for an international student to study."""

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "sonar",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.5
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        result = response.json()
        reply = result['choices'][0]['message']['content']
        return reply
    else:
        raise Exception(f"Error {response.status_code}: {response.text}")

if __name__ == "__main__":
    country = "United Kingdom"
    try:
        response_text = get_info(country)
        print(response_text)
    except Exception as e:
        print(str(e))
