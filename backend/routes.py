from flask import Blueprint, request, jsonify
from models import db, Country, CountryIndustry, CountryDisciplines, MetricGroup, Metric, country_metrics
from utils import calculate_scores
from norry import get_info
import base64

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

@bp.route('/get-country-codes', methods=['GET'])
def get_country_codes():
    countries = Country.query.all()
    
    result = []
    for c in countries:
        result.append({
            "name": c.name,
            "code": c.country_code
        })
    
    return jsonify(result), 200

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

@bp.route('/country-info', methods=['GET'])
def country_info():
    country = request.args.get('country')
    if not country:
        return jsonify({"error": "Missing country parameter"}), 400

    try:
        info = get_info(country)
        return jsonify({"country": country, "info": info})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route("/rankings")
def get_rankings():
    group_weights = {
        int(k.replace("group_", "")): float(v)
        for k, v in request.args.items()
        if k.startswith("group_")
    }
    selected_disciplines = request.args.getlist("discipline")
    selected_industries = request.args.getlist("industry")

    results = calculate_scores(
        group_weights=group_weights,
        selected_disciplines=selected_disciplines,
        selected_industries=selected_industries
    )
    return jsonify(results)

