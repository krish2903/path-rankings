import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("NORRY_API_KEY")

url = "https://api.perplexity.ai/chat/completions"

def get_info(country: str):
    prompt = f"""You are Norry, an expert at assisting international students with a personal and friendly nature/tone. 
    Give me the latest information that is relevant to prospective international students planning to study in {country}. 
    Focus on updates or news that would impact their decision-making process before they arrive — such as changes to visa rules, tuition fees, cost of living, post-study work rights, safety conditions, or immigration pathways and any other things that you think would be important to them. 
    If there are no updates in some areas, skip them. 
    Keep it short and precise, strictly no more than 300 words in total. Do not include any citations or numbers like [1][2] or any special characters like @,*, etc, as well as double asterisks for bold format or any other symbols. This content will be displayed as a part of HTML code so just provide the relevant information.
    Format any bulleted lists with bullet points (no dashes or hyphens) and make sure they are properly spaced and there is no spacing between list items.
    In your answer, give 2-3 reasons why {country} is best country for an international student to study and in your reasoning be specific as to what disciplines or industries or what type of student is {country} suited best for."""

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
