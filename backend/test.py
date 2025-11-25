import requests

# --- Configuration ---

# Base URLs for your backend APIs
BASE_URL_COUNTRY = "http://localhost:5000/api/country-rankings"
BASE_URL_UNIVERSITY = "http://localhost:5000/api/university-rankings"
BASE_URL_UNIVERSITY_LIST = "http://localhost:5000/api/get-universities" 

# The 10 test weight configurations for a 4-group model (W1, W2, W3, W4)
test_weights = [
    (1.00, 0.00, 0.00, 0.00),
    (0.00, 1.00, 0.00, 0.00),
    (0.00, 0.00, 1.00, 0.00),
    (0.00, 0.00, 0.00, 1.00),
    # (0.50, 0.50, 0.00, 0.00),
    # (0.50, 0.00, 0.50, 0.00),
    # (0.50, 0.00, 0.00, 0.50),
    # (0.00, 0.50, 0.50, 0.00),
    # (0.00, 0.50, 0.00, 0.50),
    # (0.00, 0.00, 0.50, 0.50)
]

# --- Country Specific Mappings ---

COUNTRY_GROUP_IDS = {
    "Financial": 1,         # Financial Value & Returns (G1)
    "Career": 2,            # Career Advancement Prospects (G2)
    "LifeQuality": 3,       # Life Quality & Long-term Settlement (G3)
    "GovtPolicy": 4         # Govt & Policy Environment (G4)
}

# The 26 countries to keep in final rankings
TARGET_COUNTRIES = {
    "Australia", "Austria", "Belgium", "Canada", "China",
    "Denmark", "Finland", "France", "Germany", "Ireland",
    "Italy", "Japan", "Luxembourg", "Malaysia", "Netherlands",
    "New Zealand", "Norway", "Poland", "Portugal", "Singapore",
    "South Korea", "Spain", "Sweden", "Switzerland", "United Kingdom", "United States"
}


# --- University Specific Mappings ---

UNIVERSITY_GROUP_IDS = {
    "Financial": 1,         # Financial Considerations (W1)
    "Career": 2,            # Career Advancement Prospects (W2)
    "Academic": 5,          # Academic Excellence & Research (W3)
    "StudentLife": 6        # Student Experiences & Campus Life (W4)
}

ALL_UNIVERSITY_NAMES = set() 

def fetch_all_university_names():
    global ALL_UNIVERSITY_NAMES
    print("Fetching all target university names from the database...")
    try:
        response = requests.get(BASE_URL_UNIVERSITY_LIST)
        response.raise_for_status()
        data = response.json()
        
        if data.get('success') and data.get('results'):
            university_names_list = [uni['name'] for uni in data['results'] if 'name' in uni]
            
            ALL_UNIVERSITY_NAMES = set(university_names_list)
            print(f"Successfully retrieved {len(ALL_UNIVERSITY_NAMES)} university names.")
        else:
            print("[WARNING] Could not retrieve university names. Check API response structure or if the database is empty.")
            
    except requests.RequestException as e:
        print(f"[ERROR] Failed to connect to API to fetch university list at {BASE_URL_UNIVERSITY_LIST}: {e}")
        print("Skipping university tests due to connection error.")


# --- Test Functions ---

def run_country_tests():
    """Runs tests against the country ranking endpoint."""
    print("--- Running Country Ranking Tests ---")

    # Define the group mapping structure based on the index in test_weights
    group_map = [
        COUNTRY_GROUP_IDS['Financial'], 
        COUNTRY_GROUP_IDS['Career'], 
        COUNTRY_GROUP_IDS['LifeQuality'], 
        COUNTRY_GROUP_IDS['GovtPolicy']
    ]

    for idx, (w1, w2, w3, w4) in enumerate(test_weights, start=1):
        weights = [w1, w2, w3, w4]
        
        # Build query parameters for API (group_ID=Weight)
        params = {f"group_{group_map[i]}": weights[i] for i in range(4)}

        try:
            response = requests.get(BASE_URL_COUNTRY, params=params)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"[ERROR] Test {idx} API request failed for COUNTRY: {e}")
            continue

        data = response.json()

        # Filter to the target list of countries and preserve API order
        filtered_results = [
            row["country_name"] 
            for row in data if row.get("country_name") in TARGET_COUNTRIES
        ]

        print(f"\nCountry Test {idx} - Weights: {w1}, {w2}, {w3}, {w4}")
        for rank, country in enumerate(filtered_results, start=1):
            print(f"{rank}. {country}")


def run_university_tests():
    """Runs tests against the university ranking endpoint."""
    
    if not ALL_UNIVERSITY_NAMES:
        print("Skipping university tests: No university names available.")
        return

    print(f"\n\n--- Running University Ranking Tests (Targeting {len(ALL_UNIVERSITY_NAMES)} Universities) ---")

    # Define the group mapping structure based on the index in test_weights
    group_map = [
        UNIVERSITY_GROUP_IDS['Financial'], 
        UNIVERSITY_GROUP_IDS['Career'], 
        UNIVERSITY_GROUP_IDS['Academic'], 
        UNIVERSITY_GROUP_IDS['StudentLife']
    ]

    for idx, (w1, w2, w3, w4) in enumerate(test_weights, start=1):
        weights = [w1, w2, w3, w4]

        # Build query parameters for API (group_ID=Weight)
        params = {f"group_{group_map[i]}": weights[i] for i in range(4)}
        
        try:
            response = requests.get(BASE_URL_UNIVERSITY, params=params)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"[ERROR] Test {idx} API request failed for UNIVERSITY: {e}")
            continue

        # Assuming the API returns a dict with a 'results' key
        data = response.json().get('results', [])

        # Filter to the target list of universities (which is now ALL_UNIVERSITY_NAMES)
        filtered_results = [
            row["university_name"] 
            for row in data if row.get("university_name") in ALL_UNIVERSITY_NAMES
        ]
        
        print(f"\nUniversity Test {idx} - Weights: {w1}, {w2}, {w3}, {w4}")
        
        limit = min(20, len(filtered_results)) #Change to limit the top results
        for rank, university in enumerate(filtered_results[:limit], start=1):
            score = next((row['final_score'] for row in data if row.get("university_name") == university), 'N/A')
            print(f"{rank}. {university} (Score: {score})")
            
        if len(filtered_results) > limit:
            print(f"... and {len(filtered_results) - limit} more universities.")


if __name__ == "__main__":
    # fetch_all_university_names() 
    run_country_tests()
    # run_university_tests()