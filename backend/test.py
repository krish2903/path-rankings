import requests

# Base URL for your backend API
BASE_URL = "http://localhost:5000/api/country-rankings"

# The 20 test configurations as (G1, G2, G3, G4)
# G1 = Financial Value & Returns
# G2 = Career Advancement Prospects
# G3 = Life Quality & Long-term Settlement
# G4 = Govt & Policy Environment
test_weights = [
    (1.00, 0.00, 0.00, 0.00),
    (0.00, 1.00, 0.00, 0.00),
    (0.00, 0.00, 1.00, 0.00),
    (0.00, 0.00, 0.00, 1.00),
    (0.50, 0.50, 0.00, 0.00),
    (0.50, 0.00, 0.50, 0.00),
    (0.50, 0.00, 0.00, 0.50),
    (0.00, 0.50, 0.50, 0.00),
    (0.00, 0.50, 0.00, 0.50),
    (0.00, 0.00, 0.50, 0.50)
]

# The exact mapping of group IDs in your DB for the API query parameters.
# Make sure to replace 1,2,3,4 with the actual group IDs from your MetricGroup table!
GROUP_IDS = {
    "Financial": 1,
    "Career": 2,
    "LifeQuality": 3,
    "GovtPolicy": 4
}

# The 26 countries to keep in final rankings
TARGET_COUNTRIES = {
    "Australia", "Austria", "Belgium", "Canada", "China",
    "Denmark", "Finland", "France", "Germany", "Ireland",
    "Italy", "Japan", "Luxembourg", "Malaysia", "Netherlands",
    "New Zealand", "Norway", "Poland", "Portugal", "Singapore",
    "South Korea", "Spain", "Sweden", "Switzerland", "United Kingdom", "United States"
}


def run_tests():
    for idx, (g1, g2, g3, g4) in enumerate(test_weights, start=1):
        # Build query parameters for API
        params = {
            f"group_{GROUP_IDS['Financial']}": g1,
            f"group_{GROUP_IDS['Career']}": g2,
            f"group_{GROUP_IDS['LifeQuality']}": g3,
            f"group_{GROUP_IDS['GovtPolicy']}": g4
        }

        try:
            response = requests.get(BASE_URL, params=params)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"[ERROR] Test {idx} API request failed: {e}")
            continue

        data = response.json()

        # Filter to the target list of 26 countries and preserve API order
        filtered_countries = [row["country_name"] for row in data if row["country_name"] in TARGET_COUNTRIES]

        print(f"\nTest {idx} - Weights: {g1}, {g2}, {g3}, {g4}")
        for rank, country in enumerate(filtered_countries, start=1):
            print(f"{rank}. {country}")


if __name__ == "__main__":
    print("Running API tests for weight combinations...\n")
    run_tests()
