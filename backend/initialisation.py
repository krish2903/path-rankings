# Initialise the database using the models defined in models.py 
# from app import app
# from db import db

# with app.app_context():
#     db.create_all()
#     print("All tables created!")

# import json
# from app import app
# from models import db, Country

# # Load countries.json and add countries to the database
# with open('countries.json', 'r', encoding='utf-8') as f:
#     data = json.load(f)

# with app.app_context():
#     for entry in data:
#         country_name = entry.get('country')
#         if country_name and not Country.query.filter_by(name=country_name).first():
#             country = Country(name=country_name)
#             db.session.add(country)
#     db.session.commit()
#     print("Countries imported successfully!")

# from app import app
# from models import db, MetricGroup, Metric

# metric_groups = [
#     {
#         "name": "Financial Feasibility",
#         "description": "Metrics related to affordability and financial support."
#     },
#     {
#         "name": "Career Prospects",
#         "description": "Metrics related to career opportunities and post-study work."
#     },
#     {
#         "name": "Life Quality & Settlement Aspects",
#         "description": "Metrics related to quality of life and ease of settling."
#     }
# ]

# metrics = [
#     # Financial Feasibility
#     {"name": "Scholarships", "description": "Availability of scholarships.", "group": "Financial Feasibility"},
#     {"name": "Cost of Living", "description": "Average cost of living for students.", "group": "Financial Feasibility"},
#     {"name": "Tuition Fees", "description": "Average tuition fees for international students.", "group": "Financial Feasibility"},
#     # Career Prospects
#     {"name": "Employment Rate", "description": "National employment rate.", "group": "Career Prospects"},
#     {"name": "PSW Availability", "description": "Availability of post-study work visas.", "group": "Career Prospects"},
#     {"name": "Average Income", "description": "Average graduate income.", "group": "Career Prospects"},
#     {"name": "Entrepreneurship Support", "description": "Support for student and graduate entrepreneurship.", "group": "Career Prospects"},
#     # Life Quality & Settlement Aspects
#     {"name": "Safety", "description": "General safety and security.", "group": "Life Quality & Settlement Aspects"},
#     {"name": "Cultural Diversity", "description": "Level of cultural diversity and inclusivity.", "group": "Life Quality & Settlement Aspects"},
#     {"name": "Public Transport Connectivity", "description": "Convenience and reach of public transport.", "group": "Life Quality & Settlement Aspects"},
#     {"name": "Healthcare Response", "description": "Quality and accessibility of healthcare.", "group": "Life Quality & Settlement Aspects"},
#     {"name": "Ease of PR", "description": "Ease of obtaining permanent residency.", "group": "Life Quality & Settlement Aspects"}
# ]

# with app.app_context():
#     group_objs = {}
#     for group in metric_groups:
#         mg = MetricGroup(name=group["name"], description=group["description"])
#         db.session.add(mg)
#         group_objs[group["name"]] = mg
#     db.session.commit()

#     for metric in metrics:
#         group_obj = group_objs[metric["group"]]
#         m = Metric(
#             name=metric["name"],
#             description=metric["description"],
#             group_id=group_obj.id
#         )
#         db.session.add(m)
#     db.session.commit()
#     print("Metric groups and metrics added successfully!")

# import json
# from app import app
# from models import db, Country, Metric, country_metrics

# # Map JSON keys to metric names
# metric_key_to_name = {
#     "scholarships_value": "Scholarships",
#     "living_cost_value": "Cost of Living",
#     "ug_tuition_fees_value": "UG Tuition Fees",
#     "pg_tuition_fees_value": "PG Tuition Fees",
#     "employment_rate_value": "Employment Rate",
#     "psw_value": "PSW Availability",
#     "avg_income_value": "Average Income",
#     "startup_support_value": "Entrepreneurship Support",
#     "safety_value": "Safety",
#     "cultural_diversity_value": "Cultural Diversity",
#     "public_transport_connectivity_value": "Public Transport Connectivity",
#     "healthcare_value": "Healthcare Response",
#     "pr_value": "Ease of PR"
# }

# # Load your JSON file (replace 'country_metrics.json' with your file name)
# with open('data/countries.json', 'r', encoding='utf-8') as f:
#     data = json.load(f)

# with app.app_context():
#     # Build a mapping from metric name to id
#     metric_name_to_id = {m.name: m.id for m in Metric.query.all()}
#     # Build a mapping from country name to id
#     country_name_to_id = {c.name: c.id for c in Country.query.all()}

#     for entry in data:
#         country_name = entry['country']
#         country_id = country_name_to_id.get(country_name)
#         if not country_id:
#             print(f"Country not found: {country_name}")
#             continue

#         for key, value in entry.items():
#             if key == 'country' or value in [None, ""]:
#                 continue
#             metric_name = metric_key_to_name.get(key)
#             if not metric_name:
#                 continue
#             metric_id = metric_name_to_id.get(metric_name)
#             if not metric_id:
#                 print(f"Metric not found for key: {key} ({metric_name})")
#                 continue

#             # Convert value to float if possible
#             try:
#                 raw_value = float(value)
#             except (ValueError, TypeError):
#                 print(f"Could not convert value for {country_name} {metric_name}: {value}")
#                 continue

#             # Manual upsert: check if record exists
#             result = db.session.execute(
#                 country_metrics.select().where(
#                     (country_metrics.c.country_id == country_id) &
#                     (country_metrics.c.metric_id == metric_id)
#                 )
#             ).fetchone()

#             if result:
#                 # Update existing record
#                 db.session.execute(
#                     country_metrics.update().where(
#                         (country_metrics.c.country_id == country_id) &
#                         (country_metrics.c.metric_id == metric_id)
#                     ).values(raw_value=raw_value)
#                 )
#             else:
#                 # Insert new record
#                 db.session.execute(
#                     country_metrics.insert().values(
#                         country_id=country_id,
#                         metric_id=metric_id,
#                         raw_value=raw_value
#                     )
#                 )

#     db.session.commit()
#     print("Country metrics imported successfully!")

# import json
# from app import app
# from models import db, Country, country_metrics
# from sqlalchemy.dialects.postgresql import insert  # <-- THIS IS IMPORTANT

# UG_TUITION_METRIC_ID = 3
# PG_TUITION_METRIC_ID = 13

# Load fees.json and add/update tuition fees to the database
# with open('data/fees.json', 'r', encoding='utf-8') as f:
#     data = json.load(f)

# with app.app_context():
#     for entry in data:
#         country_name = entry.get('Country')
#         ug_fee = entry.get('UG Tuition Fees')
#         pg_fee = entry.get('PG Tuition Fees')
#         country = Country.query.filter_by(name=country_name).first()
#         if not country:
#             print(f"Country not found: {country_name}")
#             continue

#         UG Tuition Fees Upsert
#         stmt_ug = insert(country_metrics).values(
#             country_id=country.id,
#             metric_id=UG_TUITION_METRIC_ID,
#             raw_value=ug_fee
#         ).on_conflict_do_update(
#             index_elements=['country_id', 'metric_id'],
#             set_=dict(raw_value=ug_fee)
#         )
#         db.session.execute(stmt_ug)

#         PG Tuition Fees Upsert
#         stmt_pg = insert(country_metrics).values(
#             country_id=country.id,
#             metric_id=PG_TUITION_METRIC_ID,
#             raw_value=pg_fee
#         ).on_conflict_do_update(
#             index_elements=['country_id', 'metric_id'],
#             set_=dict(raw_value=pg_fee)
#         )
#         db.session.execute(stmt_pg)

#         print(f"Updated {country_name}: UG={ug_fee}, PG={pg_fee}")

#     db.session.commit()
#     print("Tuition fees imported/updated successfully!")

# import json
# from app import app
# from models import db, CountryIndustry

# # List of countries and their industry data
# country_industry_data = [
#     {
#         "country": "Australia",
#         "dominant_industries": [
#             "Energy & Utilities",
#             "Banking, Finance & Real-Estate",
#             "Healthcare & Life Sciences",
#             "Materials & Manufacturing",
#             "Information Technology (IT)"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)"
#         ],
#         "comments": "Energy & Utilities dominate due to natural resources and exports. Banking is strong in major cities. Healthcare and IT are expanding with population growth and digitalization. Manufacturing output: $92.67B.[2][6]"
#     },
#     {
#         "country": "Austria",
#         "dominant_industries": [
#             "Materials & Manufacturing",
#             "Banking, Finance & Real-Estate",
#             "Healthcare & Life Sciences",
#             "Public Sector, Education & Research",
#             "Consumer Goods & Retail"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)"
#         ],
#         "comments": "Manufacturing is a traditional strength ($81.21B). Green energy is expanding due to EU climate goals. Healthcare and IT are driven by aging population and digital transformation.[2][6]"
#     },
#     {
#         "country": "Belgium",
#         "dominant_industries": [
#             "Materials & Manufacturing",
#             "Healthcare & Life Sciences",
#             "Banking, Finance & Real-Estate",
#             "Consumer Goods & Retail"
#         ],
#         "growing_industries": [
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)",
#             "Energy & Utilities"
#         ],
#         "comments": "Pharma/chemicals are world leaders. Biotech is growing due to R&D investment. IT and green energy are EU priorities. Manufacturing output: $72.57B.[2][6]"
#     },
#     {
#         "country": "Canada",
#         "dominant_industries": [
#             "Energy & Utilities",
#             "Banking, Finance & Real-Estate",
#             "Materials & Manufacturing",
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)"
#         ],
#         "comments": "Energy & Utilities (oil, gas, hydro) are major exports. Finance is stable. Healthcare and IT are expanding. Manufacturing output: $279.78B.[2][6]"
#     },
#     {
#         "country": "China",
#         "dominant_industries": [
#             "Materials & Manufacturing",
#             "Information Technology (IT)",
#             "Banking, Finance & Real-Estate",
#             "Energy & Utilities",
#             "Consumer Goods & Retail"
#         ],
#         "growing_industries": [
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences",
#             "Energy & Utilities"
#         ],
#         "comments": "World’s largest manufacturer ($4.66T). IT and consumer goods are global leaders. Healthcare is expanding with middle class and aging population.[1][2][6]"
#     },
#     {
#         "country": "Denmark",
#         "dominant_industries": [
#             "Healthcare & Life Sciences",
#             "Materials & Manufacturing",
#             "Energy & Utilities",
#             "Information Technology (IT)",
#             "Consumer Goods & Retail"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)"
#         ],
#         "comments": "Pharma (Novo Nordisk) and wind energy are global leaders. Green energy is booming. Manufacturing output: $64.97B.[2][6]"
#     },
#     {
#         "country": "Finland",
#         "dominant_industries": [
#             "Information Technology (IT)",
#             "Materials & Manufacturing",
#             "Healthcare & Life Sciences",
#             "Energy & Utilities"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences"
#         ],
#         "comments": "IT (Nokia legacy), advanced manufacturing ($44.14B), and green tech are top growth sectors.[2][6]"
#     },
#     {
#         "country": "France",
#         "dominant_industries": [
#             "Materials & Manufacturing",
#             "Banking, Finance & Real-Estate",
#             "Healthcare & Life Sciences",
#             "Energy & Utilities",
#             "Consumer Goods & Retail"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)"
#         ],
#         "comments": "Manufacturing ($297B) and finance are global players. Green energy and IT are top growth areas due to EU policy and investment.[2][6]"
#     },
#     {
#         "country": "Germany",
#         "dominant_industries": [
#             "Materials & Manufacturing",
#             "Banking, Finance & Real-Estate",
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)",
#             "Consumer Goods & Retail"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences"
#         ],
#         "comments": "Europe’s manufacturing powerhouse ($838.89B); auto sector is globally dominant. Green energy and IT are growing with digital/green transition.[1][2][6]"
#     },
#     {
#         "country": "Ireland",
#         "dominant_industries": [
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)",
#             "Banking, Finance & Real-Estate",
#             "Materials & Manufacturing"
#         ],
#         "growing_industries": [
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)",
#             "Energy & Utilities"
#         ],
#         "comments": "Pharma and IT are driven by FDI and tax policy. Biotech and green energy are expanding. Manufacturing output: $162.32B.[2][6]"
#     },
#     {
#         "country": "Italy",
#         "dominant_industries": [
#             "Materials & Manufacturing",
#             "Consumer Goods & Retail",
#             "Banking, Finance & Real-Estate",
#             "Public Sector, Education & Research"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences"
#         ],
#         "comments": "Manufacturing ($353.62B) and fashion are global brands. Green energy and IT are top growth sectors.[2][6]"
#     },
#     {
#         "country": "Japan",
#         "dominant_industries": [
#             "Materials & Manufacturing",
#             "Information Technology (IT)",
#             "Banking, Finance & Real-Estate",
#             "Healthcare & Life Sciences",
#             "Consumer Goods & Retail"
#         ],
#         "growing_industries": [
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences",
#             "Materials & Manufacturing"
#         ],
#         "comments": "Manufacturing and automotive are world leaders. Robotics and IT are expanding with tech innovation. Manufacturing output: $4.19T.[1][2]"
#     },
#     {
#         "country": "Luxembourg",
#         "dominant_industries": [
#             "Banking, Finance & Real-Estate",
#             "Information Technology (IT)",
#             "Materials & Manufacturing"
#         ],
#         "growing_industries": [
#             "Banking, Finance & Real-Estate",
#             "Information Technology (IT)",
#             "Energy & Utilities"
#         ],
#         "comments": "Finance is dominant due to favorable regulation. FinTech and green finance are top growth areas. Manufacturing output: $3.03B.[2][3]"
#     },
#     {
#         "country": "Malaysia",
#         "dominant_industries": [
#             "Materials & Manufacturing",
#             "Information Technology (IT)",
#             "Energy & Utilities",
#             "Banking, Finance & Real-Estate"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences"
#         ],
#         "comments": "Manufacturing ($92B) and electronics are export drivers. Green tech and IT are fast-growing.[2][6]"
#     },
#     {
#         "country": "Netherlands",
#         "dominant_industries": [
#             "Consumer Goods & Retail",
#             "Materials & Manufacturing",
#             "Banking, Finance & Real-Estate",
#             "Energy & Utilities"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Information Technology (IT)",
#             "Consumer Goods & Retail"
#         ],
#         "comments": "Major food/agri exporter, strong manufacturing ($125.15B). Green energy and AgriTech are expanding.[2][6]"
#     },
#     {
#         "country": "New Zealand",
#         "dominant_industries": [
#             "Consumer Goods & Retail",
#             "Materials & Manufacturing",
#             "Energy & Utilities",
#             "Public Sector, Education & Research"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)"
#         ],
#         "comments": "Agriculture and food are major exports. Green tech and healthcare are top growth sectors.[6]"
#     },
#     {
#         "country": "Norway",
#         "dominant_industries": [
#             "Energy & Utilities",
#             "Materials & Manufacturing",
#             "Banking, Finance & Real-Estate",
#             "Information Technology (IT)"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences"
#         ],
#         "comments": "Oil/gas dominate, but green energy (hydro, wind) is growing rapidly. Manufacturing output: $29.41B.[2][6]"
#     },
#     {
#         "country": "Poland",
#         "dominant_industries": [
#             "Materials & Manufacturing",
#             "Information Technology (IT)",
#             "Banking, Finance & Real-Estate",
#             "Consumer Goods & Retail"
#         ],
#         "growing_industries": [
#             "Information Technology (IT)",
#             "Energy & Utilities",
#             "Healthcare & Life Sciences"
#         ],
#         "comments": "Manufacturing ($135.62B) and IT are key sectors. IT and green energy are growing with EU investment.[2][6]"
#     },
#     {
#         "country": "Portugal",
#         "dominant_industries": [
#             "Consumer Goods & Retail",
#             "Materials & Manufacturing",
#             "Energy & Utilities",
#             "Information Technology (IT)"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences"
#         ],
#         "comments": "Tourism and manufacturing ($34.32B) are major contributors. Green energy and IT are top growth sectors.[2][6]"
#     },
#     {
#         "country": "Singapore",
#         "dominant_industries": [
#             "Banking, Finance & Real-Estate",
#             "Materials & Manufacturing",
#             "Information Technology (IT)",
#             "Consumer Goods & Retail"
#         ],
#         "growing_industries": [
#             "Banking, Finance & Real-Estate",
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)"
#         ],
#         "comments": "Finance and manufacturing ($88.5B) are global leaders. FinTech and biotech are top growth sectors.[2][3][8]"
#     },
#     {
#         "country": "South Korea",
#         "dominant_industries": [
#             "Materials & Manufacturing",
#             "Information Technology (IT)",
#             "Consumer Goods & Retail",
#             "Banking, Finance & Real-Estate"
#         ],
#         "growing_industries": [
#             "Information Technology (IT)",
#             "Consumer Goods & Retail",
#             "Healthcare & Life Sciences"
#         ],
#         "comments": "Manufacturing ($416.39B), IT, and auto are export powerhouses. AI and EVs are fast-growing.[2][6]"
#     },
#     {
#         "country": "Spain",
#         "dominant_industries": [
#             "Consumer Goods & Retail",
#             "Materials & Manufacturing",
#             "Banking, Finance & Real-Estate",
#             "Energy & Utilities"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences"
#         ],
#         "comments": "Tourism and manufacturing ($176.45B) are key. Green energy and IT are expanding with EU funds.[2][6]"
#     },
#     {
#         "country": "Sweden",
#         "dominant_industries": [
#             "Materials & Manufacturing",
#             "Information Technology (IT)",
#             "Banking, Finance & Real-Estate",
#             "Energy & Utilities"
#         ],
#         "growing_industries": [
#             "Energy & Utilities",
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences"
#         ],
#         "comments": "Manufacturing ($83.01B) and IT are strong. Green energy is a top growth sector.[2][6]"
#     },
#     {
#         "country": "Switzerland",
#         "dominant_industries": [
#             "Banking, Finance & Real-Estate",
#             "Healthcare & Life Sciences",
#             "Materials & Manufacturing",
#             "Information Technology (IT)"
#         ],
#         "growing_industries": [
#             "Healthcare & Life Sciences",
#             "Energy & Utilities",
#             "Information Technology (IT)"
#         ],
#         "comments": "Finance and pharma are global leaders. Biotech and green tech are fast-growing. Manufacturing output: $160.23B.[2][3]"
#     },
#     {
#         "country": "United Kingdom",
#         "dominant_industries": [
#             "Banking, Finance & Real-Estate",
#             "Materials & Manufacturing",
#             "Healthcare & Life Sciences",
#             "Information Technology (IT)",
#             "Public Sector, Education & Research"
#         ],
#         "growing_industries": [
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences",
#             "Energy & Utilities"
#         ],
#         "comments": "Finance (London) and manufacturing ($279.78B) are key. AI and green energy are top growth sectors.[1][2][6]"
#     },
#     {
#         "country": "United States",
#         "dominant_industries": [
#             "Information Technology (IT)",
#             "Banking, Finance & Real-Estate",
#             "Healthcare & Life Sciences",
#             "Materials & Manufacturing",
#             "Energy & Utilities"
#         ],
#         "growing_industries": [
#             "Information Technology (IT)",
#             "Healthcare & Life Sciences",
#             "Energy & Utilities"
#         ],
#         "comments": "IT (Silicon Valley), finance (NYC), healthcare, and manufacturing ($2.5T+). AI and healthcare are fastest-growing globally.[1][2][6]"
#     }
# ]

# with app.app_context():
#     # Optional: Clear old data
#     CountryIndustry.query.delete()
#     db.session.commit()

#     for entry in country_industry_data:
#         country = entry["country"]
#         dominant = entry["dominant_industries"]
#         growing = entry["growing_industries"]
#         comments = entry["comments"]

#         # Upsert logic
#         ci = CountryIndustry.query.filter_by(country=country).first()
#         if ci:
#             ci.dominant_industries = dominant
#             ci.growing_industries = growing
#             ci.comments = comments
#         else:
#             ci = CountryIndustry(
#                 country=country,
#                 dominant_industries=dominant,
#                 growing_industries=growing,
#                 comments=comments
#             )
#             db.session.add(ci)
#     db.session.commit()
#     print("Country industries data imported/updated successfully!")

# from app import app
# from models import db, Country, Metric, MetricGroup, country_metrics
# import csv

# csv_metric_names = {
#     "scholarships": "Scholarships & Financial Aid",
#     "roi": "Return on Education Investment",
#     "career_payback_period": "Career Payback Period",
#     "term_time_feasibility": "Term-time Financial Feasibility",
#     "max_psw_visa_years": "PSW Visa",
#     "skilled_worker_visa": "Skilled Worker Visa",
#     "max_startup_visa_years": "Startup Visa",
#     "safety_index": "Safety",
#     "cultural_diversity": "Cultural Diversity",
#     "health_index": "Healthcare Response",
#     "min_years_pr": "Ease of PR",
#     "visa_approval_rate": "Student Visa Approval Rate",
#     "political_stability": "Political Stability",
# }

# with app.app_context():
#     with open("data/country_data_new.csv", mode='r', encoding='utf-8-sig') as file:
#         reader = csv.DictReader(file)
#         for row in reader:
#             country_name = row['country'].strip()
#             if not country_name:
#                 continue

#             country = Country.query.filter_by(name=country_name).first()
#             if not country:
#                 country = Country(name=country_name)
#                 db.session.add(country)
#                 db.session.flush()

#             for csv_field, metric_name in csv_metric_names.items():
#                 raw_value = row.get(csv_field)
#                 if raw_value is None or raw_value == '':
#                     continue
#                 try:
#                     raw_value_float = float(raw_value.replace(',', '')) if isinstance(raw_value, str) else float(raw_value)
#                 except ValueError:
#                     continue

#                 metric = Metric.query.filter_by(name=metric_name).first()
#                 if not metric:
#                     metric_group = MetricGroup.query.first()
#                     if not metric_group:
#                         metric_group = MetricGroup(name='Default', description='Default group for metrics')
#                         db.session.add(metric_group)
#                         db.session.flush()

#                     metric = Metric(
#                         name=metric_name,
#                         description='',
#                         group_id=metric_group.id,
#                         is_positive=True
#                     )
#                     db.session.add(metric)
#                     db.session.flush()

#                 stmt = country_metrics.select().where(
#                     (country_metrics.c.country_id == country.id) &
#                     (country_metrics.c.metric_id == metric.id)
#                 )
#                 existing = db.session.execute(stmt).first()

#                 if not existing:
#                     ins = country_metrics.insert().values(
#                         country_id=country.id,
#                         metric_id=metric.id,
#                         raw_value=raw_value_float
#                     )
#                     db.session.execute(ins)
#                 else:
#                     # Optionally update existing value here
#                     pass

#         db.session.commit()

# from app import app
# from models import db, CountryDisciplines
# import json

# with app.app_context():
#     with open('data/country_disciplines.json', 'r', encoding='utf-8') as f:
#         data = json.load(f)
#         for entry in data:
#             country_name = entry.get('country', '').strip()
#             if not country_name:
#                 continue

#             existing = CountryDisciplines.query.filter_by(country=country_name).first()
#             if existing:
#                 continue

#             new_entry = CountryDisciplines(
#                 country=country_name,
#                 top_disciplines=entry.get('top_disciplines', []),
#                 comments=entry.get('comments', '')
#             )
#             db.session.add(new_entry)
        
#     db.session.commit()

import os
from app import app, db
from models import Country  # adjust to your actual import

def format_country_filename(name):
    # Lowercase and replace spaces with underscores
    return name.lower().replace(" ", "_")

with app.app_context():
    flags_dir = "data/flags"

    countries = Country.query.all()
    for country in countries:
        filename = f"{format_country_filename(country.name)}.png"
        filepath = os.path.join(flags_dir, filename)

        if not os.path.isfile(filepath):
            print(f"Flag file not found for {country.name}: {filepath}")
            continue

        with open(filepath, "rb") as f:
            flag_bytes = f.read()

        country.flag = flag_bytes
        print(f"Added flag for {country.name}")

    db.session.commit()
    print("All flags added to database.")
