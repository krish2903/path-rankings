from flask import Blueprint, request, jsonify
from models import University, db, Country, CountryIndustry, CountryDisciplines, MetricGroup, CountryDetails, UniversityDetails, Metric, country_metrics, university_metrics
from utils import calculate_country_scores, calculate_university_scores
from norry import get_country_info, get_uni_info
import base64
import json
from sqlalchemy.orm import joinedload
from datetime import datetime

bp = Blueprint('api', __name__, url_prefix='/api')

# @bp.route('/add-countries', methods=['POST'])
# def add_country():
#     data = request.json
#     new_country = Country(name=data['name'])
#     db.session.add(new_country)
#     db.session.commit()
#     return jsonify({'id': new_country.id}), 201

# @bp.route('/add-metric-groups', methods=['POST'])
# def add_metric_group():
#     data = request.json
#     new_group = MetricGroup(name=data['name'], description=data.get('description'))
#     db.session.add(new_group)
#     db.session.commit()
#     return jsonify({'id': new_group.id}), 201

# @bp.route('/add-metrics', methods=['POST'])
# def add_metric():
#     data = request.json
#     new_metric = Metric(
#         name=data['name'],
#         description=data.get('description'),
#         group_id=data['group_id']
#     )
#     db.session.add(new_metric)
#     db.session.commit()
#     return jsonify({'id': new_metric.id}), 201

# @bp.route('/add-country-metrics', methods=['POST'])
# def add_country_metric():
#     data = request.json
#     country_id = data['country_id']
#     metric_id = data['metric_id']
#     raw_value = data['raw_value']

#     stmt = country_metrics.insert().values(
#         country_id=country_id, metric_id=metric_id, raw_value=raw_value
#     ).on_conflict_do_update(
#         index_elements=['country_id', 'metric_id'],
#         set_=dict(raw_value=raw_value)
#     )
#     db.session.execute(stmt)
#     db.session.commit()
#     return jsonify({'message': 'Metric value added/updated'}), 201

@bp.route('/get-countries', methods=['GET'])
def get_countries():
    countries = Country.query.all()

    result = []
    for c in countries:
        flag_data_url = None
        if c.flag:
            encoded_flag = base64.b64encode(c.flag).decode('utf-8')
            flag_data_url = f"data:image/png;base64,{encoded_flag}"

        result.append({
            "id": c.id,
            "name": c.name,
            "flag": flag_data_url
        })

    return jsonify(result), 200

@bp.route('/get-universities', methods=['GET'])
def get_universities():
    try:
        universities = db.session.query(University).options(
            joinedload(University.country)
        ).all()
        
        result = []
        for u in universities:
            country_name = u.country.name if u.country else None
            country_flag = u.country.flag if u.country else None
            if country_flag:
                encoded_flag = base64.b64encode(country_flag).decode('utf-8')
                country_flag = f"data:image/png;base64,{encoded_flag}"
            else: country_flag = None
            
            result.append({
                "id": u.id,
                "name": u.name,
                "city": u.city,
                "country_name": country_name, 
                "country_flag": country_flag
            })
        
        return jsonify(result), 200

    except Exception as e:
        print(f"Error fetching university list: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch university list.",
            "details": str(e)
        }), 500

@bp.route('/get-cities', methods=['GET'])
def get_cities():
    try:
        cities = db.session.query(University.city).distinct().all()
        
        unique_cities = [c[0] for c in cities if c[0]]
        
        result = [{"city": city} for city in unique_cities]
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Error fetching city list: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch city list.",
            "details": str(e)
        }), 500

@bp.route('/get-metric-groups', methods=['GET'])
def get_metric_groups():
    groups = MetricGroup.query.all()
    return jsonify([{"id": g.id, "name": g.name, "description": g.description} for g in groups]), 200

@bp.route('/get-metrics', methods=['GET'])
def get_metrics():
    metrics = Metric.query.all()
    return jsonify([
        {
            "id": m.id,
            "name": m.name,
            "description": m.description,
            "group_id": m.group_id,
            "is_positive": m.is_positive
        }
        for m in metrics
    ]), 200

@bp.route('/industries', methods=['GET'])
def get_country_industries():
    industries = CountryIndustry.query.all()
    result = [c.to_dict() for c in industries]
    return jsonify(result)

@bp.route('/disciplines', methods=['GET'])
def get_country_disciplines():
    disciplines = CountryDisciplines.query.all()
    result = [c.to_dict() for c in disciplines]
    return jsonify(result)

@bp.route('/country-metrics', methods=['GET'])
def get_country_metrics():
    country_id = request.args.get('country_id', type=int)
    country_name = request.args.get('country_name', type=str)

    country = None
    if country_id:
        country = Country.query.filter_by(id=country_id).first()
    elif country_name:
        country = Country.query.filter(Country.name.ilike(country_name)).first()

    if not country:
        return jsonify({"error": "Country not found"}), 404

    query = (
        db.session.query(
            MetricGroup.name.label('metric_group_name'),
            Metric.name.label('metric_name'),
            Metric.description.label('metric_description'),
            Metric.unit.label('unit'),                             
            country_metrics.c.raw_value
        )
        .join(Metric, Metric.id == country_metrics.c.metric_id)
        .join(MetricGroup, Metric.group_id == MetricGroup.id)
        .filter(country_metrics.c.country_id == country.id)
    )

    results = []
    for row in query.all():
        results.append({
            "metric_group": row.metric_group_name,
            "metric_name": row.metric_name,
            "metric_description": row.metric_description,
            "unit": row.unit,
            "raw_value": row.raw_value
        })

    return jsonify(results)

@bp.route('/uni-metrics', methods=['GET'])
def get_uni_metrics():
    uni_id = request.args.get('uni_id', type=int)
    uni_name = request.args.get('uni_name', type=str)

    university = None
    if uni_id is not None:
        university = University.query.filter_by(id=uni_id).first()
    elif uni_name:
        university = University.query.filter(
            University.name.ilike(uni_name)
        ).first()  

    if not university:
        return jsonify({"error": "University not found"}), 404

    query = (
        db.session.query(
            MetricGroup.name.label('metric_group_name'),
            Metric.name.label('metric_name'),
            Metric.description.label('metric_description'),
            Metric.unit.label('unit'),
            university_metrics.c.raw_value
        )
        .join(Metric, Metric.group_id == MetricGroup.id)
        .join(university_metrics, Metric.id == university_metrics.c.metric_id)
        .filter(university_metrics.c.university_id == university.id)
    )

    results = [
        {
            "metric_group": row.metric_group_name,
            "metric_name": row.metric_name,
            "metric_description": row.metric_description,
            "unit": row.unit,
            "raw_value": row.raw_value,
        }
        for row in query.all()
    ]

    return jsonify(results)

@bp.route('/country-info', methods=['GET'])
def country_info():
    country_name = request.args.get('country')
    if not country_name:
        return jsonify({"error": "Missing country parameter"}), 400

    try:
        cards_obj, citations_info = get_country_info(country_name)
        cards = cards_obj.get("cards", []) if cards_obj else []
        print("Live cards:", cards)
        print("Citations:", citations_info)

        if cards and len(cards) == 6:
            country = Country.query.filter(Country.name.ilike(country_name)).first()
            if country:
                try:
                    if country.details:
                        country.details.cards = cards
                        country.details.fetch_date = datetime.now()
                    else:
                        country.details = CountryDetails(
                            country_id=country.id,
                            country_name=country_name,
                            cards=cards,
                            fetch_date=datetime.now(),
                        )
                    db.session.commit()
                except Exception as db_error:
                    print(f"⚠️ Database update failed for {country_name}: {str(db_error)}")

            return jsonify({
                "country": country_name,
                "cards": cards,
                "citations": citations_info,
                "source": "live",
            })
        else:
            print(f"⚠️ Live API returned {len(cards)} cards (expected 6)")
    except Exception as live_error:
        print(f"❌ Live API failed: {str(live_error)}")

    try:
        country = Country.query.filter(Country.name.ilike(country_name)).first()

        if country and country.details and country.details.cards:
            cards = country.details.cards
            return jsonify({
                "country": country_name,
                "cards": cards,
                "source": "fallback",
                "last_updated": country.details.fetch_date.isoformat() if country.details.fetch_date else None,
            })
        else:
            print(f"❌ No fallback data found for {country_name}")
    except Exception as fallback_error:
        print(f"❌ Fallback failed: {str(fallback_error)}")

    return jsonify({
        "country": country_name,
        "cards": [],
        "source": "none",
        "message": "No data available",
    }), 200

@bp.route('/uni-info', methods=['GET'])
def uni_info():
    university = request.args.get('uni')
    if not university:
        return jsonify({"error": "Missing university parameter"}), 400

    try:
        cards_obj, citations_info = get_uni_info(university)
        cards = cards_obj.get("cards", []) if cards_obj else []
        print("Live cards:", cards)
        print("Citations:", citations_info)

        if cards and len(cards) == 6:
            uni = University.query.filter(University.name.ilike(university)).first()
            if uni:
                try:
                    if uni.details:
                        uni.details.cards = cards
                        uni.details.fetch_date = datetime.now()
                    else:
                        uni.details = UniversityDetails(
                            uni_id=uni.id,
                            uni_name=university,
                            cards=cards,
                            fetch_date=datetime.now(),
                        )
                    db.session.commit()
                except Exception as db_error:
                    print(f"⚠️ Database update failed for {university}: {str(db_error)}")

            return jsonify({
                "university": university,
                "cards": cards,
                "citations": citations_info,
                "source": "live",
            })
        else:
            print(f"⚠️ Live API returned {len(cards)} cards (expected 6)")
    except Exception as live_error:
        print(f"❌ Live API failed for {university}: {str(live_error)}")

    try:
        uni = University.query.filter(University.name.ilike(university)).first()

        if uni and uni.details and uni.details.cards:
            cards = uni.details.cards
            return jsonify({
                "university": university,
                "cards": cards,
                "source": "fallback",
                "last_updated": uni.details.fetch_date.isoformat() if uni.details.fetch_date else None,
            })
        else:
            print(f"❌ No fallback data found for {university}")
    except Exception as fallback_error:
        print(f"❌ Fallback failed for {university}: {str(fallback_error)}")

    return jsonify({
        "university": university,
        "cards": [],
        "source": "none",
        "message": "No data available",
    }), 200

@bp.route("/country-rankings")
def get_rankings():
    group_weights = {
        int(k.replace("group_", "")): float(v)
        for k, v in request.args.items()
        if k.startswith("group_")
    }
    selected_disciplines = request.args.getlist("discipline")
    selected_industries = request.args.getlist("industry")

    results = calculate_country_scores(
        group_weights=group_weights,
        selected_disciplines=selected_disciplines,
        selected_industries=selected_industries
    )
    return jsonify(results)

@bp.route('/university-rankings', methods=['GET'])
def university_rankings():
    try:
        group_weights = {
            int(k.replace("group_", "")): float(v)
            for k, v in request.args.items()
            if k.startswith("group_")
        }

        ranked_results = calculate_university_scores(group_weights=group_weights)
        
        return jsonify(ranked_results)

    except Exception as e:
        print(f"Error calculating university rankings: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to calculate rankings.",
            "details": str(e)
        }), 500