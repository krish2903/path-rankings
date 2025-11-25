import math
from models import (
    db,
    Country,
    University, 
    Metric,
    MetricGroup,
    country_metrics,
    university_metrics, 
    CountryIndustry,
    CountryDisciplines
)

def calculate_country_scores(group_weights=None, selected_disciplines=None, selected_industries=None):
    countries = Country.query.all()
    metric_groups = MetricGroup.query.filter(MetricGroup.category.in_(["country", "both"])).all()
    group_ids = [mg.id for mg in metric_groups]
    metrics = Metric.query.filter(Metric.group_id.in_(group_ids)).all()

    if group_weights is None:
        group_weights = {}
        total_groups = len(metric_groups)
        for group in metric_groups:
            group_weights[group.id] = 1.0 / total_groups

    group_to_metrics = {}
    group_id_to_name = {}
    for mg in metric_groups:
        group_to_metrics[mg.id] = [m for m in metrics if m.group_id == mg.id]
        group_id_to_name[mg.id] = mg.name

    metric_log_ranges = {}
    metric_log_values = {}
    for metric in metrics:
        results = db.session.execute(
            country_metrics.select().where(country_metrics.c.metric_id == metric.id)
        ).fetchall()

        raw_values = [row.raw_value for row in results if row.raw_value is not None]
        log_values = [math.log(v + 1) for v in raw_values]

        metric_log_values[metric.id] = {
            row.country_id: log_val 
            for row, log_val in zip(results, log_values)
            if row.raw_value is not None
        }

        min_log = min(log_values) if log_values else 0
        max_log = max(log_values) if log_values else 1
        metric_log_ranges[metric.id] = (min_log, max_log)

    country_discipline_map = {
        row.country: list(row.top_disciplines)
        for row in CountryDisciplines.query.all()
    }
    country_industry_map = {
        row.country: list(row.dominant_industries)
        for row in CountryIndustry.query.all()
    }
    
    # First pass: calculate raw group scores for all countries
    all_group_raw_scores = {group.id: {} for group in metric_groups}
    country_temp = {}

    for country in countries:
        group_scores = {}

        for group_id, metrics_in_group in group_to_metrics.items():
            group_score = 0
            group_metric_scores = {}
            num_metrics = len(metrics_in_group)
            if num_metrics == 0:
                continue
            metric_weight = 1 / num_metrics

            for metric in metrics_in_group:
                normalised = 50
                if country.id in metric_log_values[metric.id]:
                    log_value = metric_log_values[metric.id][country.id]
                    min_log, max_log = metric_log_ranges[metric.id]

                    if max_log - min_log > 0:
                        normalised = (log_value - min_log) / (max_log - min_log) * 100

                    if not metric.is_positive:
                        normalised = 100 - normalised

                    group_metric_scores[metric.name] = round(normalised, 2)
                    group_score += normalised * metric_weight

            all_group_raw_scores[group_id][country.id] = group_score
            group_scores[group_id_to_name[group_id]] = {
                "raw_group_score": group_score,
                "metrics": group_metric_scores,
            }
        
        country_temp[country.id] = {
            "country": country,
            "group_scores": group_scores
        }

    # Second pass: normalize group scores within each group (0-100 scale)
    for group_id, scores_by_country in all_group_raw_scores.items():
        values = list(scores_by_country.values())
        if not values:
            continue
        min_s, max_s = min(values), max(values)

        for country_id, raw_score in scores_by_country.items():
            if max_s > min_s:
                norm_score = (raw_score - min_s) / (max_s - min_s) * 100
            else:
                norm_score = 50

            group_name = group_id_to_name[group_id]
            country_temp[country_id]["group_scores"][group_name]["group_score"] = round(norm_score, 2)

    # Third pass: compute weighted scores with normalized group scores and final scores
    results = []
    for country_id, data in country_temp.items():
        country = data["country"]
        group_scores = data["group_scores"]
        total_score = 0

        for group_name, g_data in group_scores.items():
            group_id = next((gid for gid, name in group_id_to_name.items() if name == group_name), None)
            weight = group_weights.get(group_id, 0)
            group_score_norm = g_data.get("group_score", 0)
            weighted_score = group_score_norm * weight
            g_data["group_score_weighted"] = round(weighted_score, 2)
            total_score += weighted_score

        discipline_score, industry_score = 0, 0

        if selected_disciplines:
            top_disciplines = country_discipline_map.get(country.name, [])
            if top_disciplines:
                for sel in selected_disciplines:
                    if sel in top_disciplines:
                        i = top_disciplines.index(sel)
                        discipline_score += 100 - 20 * i

        if selected_industries:
            top_dominant = country_industry_map.get(country.name, [])
            if top_dominant:
                for sel in selected_industries:
                    if sel in top_dominant:
                        i = top_dominant.index(sel)
                        industry_score += 100 - 20 * i

        has_disciplines = bool(selected_disciplines and len(selected_disciplines) > 0)
        has_industries = bool(selected_industries and len(selected_industries) > 0)

        if not has_disciplines and not has_industries:
            overall_weight, discipline_weight, industry_weight = 1.0, 0.0, 0.0
        elif has_disciplines and not has_industries:
            overall_weight, discipline_weight, industry_weight = 0.8, 0.2, 0.0
        elif not has_disciplines and has_industries:
            overall_weight, discipline_weight, industry_weight = 0.8, 0.0, 0.2
        else:
            overall_weight, discipline_weight, industry_weight = 0.8, 0.1, 0.1

        final_score = (
            total_score * overall_weight
            + discipline_score * discipline_weight
            + industry_score * industry_weight
        )

        results.append({
            "country_id": country.id,
            "country_name": country.name,
            "country_code": country.country_code,
            "overall_score": round(total_score, 2),
            "discipline_score": round(discipline_score, 2),
            "industry_score": round(industry_score, 2),
            "final_score": round(final_score, 2),
            "groups": group_scores
        })

    return sorted(results, key=lambda x: x["final_score"], reverse=True)

def calculate_university_scores(group_weights=None):
    universities = University.query.all()
    metric_groups = MetricGroup.query.filter(MetricGroup.category.in_(["uni", "both"])).all()
    group_ids = [mg.id for mg in metric_groups]
    metrics = Metric.query.filter(Metric.group_id.in_(group_ids)).all()

    if group_weights is None:
        group_weights = {}
        total_groups = len(metric_groups)
        for group in metric_groups:
            group_weights[group.id] = 1.0 / total_groups

    group_to_metrics = {}
    group_id_to_name = {}
    for mg in metric_groups:
        group_to_metrics[mg.id] = [m for m in metrics if m.group_id == mg.id]
        group_id_to_name[mg.id] = mg.name

    metric_log_ranges = {}
    metric_log_values = {}

    for metric in metrics:
        results = db.session.execute(
            university_metrics.select().where(university_metrics.c.metric_id == metric.id)
        ).fetchall()

        raw_values = [row.raw_value for row in results if row.raw_value is not None]
        log_values = [math.log(v + 1) for v in raw_values]

        metric_log_values[metric.id] = {
            row.university_id: log_val 
            for row, log_val in zip(results, log_values)
            if row.raw_value is not None
        }

        min_log = min(log_values) if log_values else 0
        max_log = max(log_values) if log_values else 1
        metric_log_ranges[metric.id] = (min_log, max_log)

    # First pass: calculate raw group scores for all universities
    all_group_raw_scores = {group.id: {} for group in metric_groups}
    university_temp = {}

    for university in universities:
        group_scores = {}

        for group_id, metrics_in_group in group_to_metrics.items():
            group_score = 0
            group_metric_scores = {}
            num_metrics = len(metrics_in_group)
            weight = group_weights.get(group_id, 0)
            if num_metrics == 0:
                # Skip empty groups
                continue
            metric_weight = 1 / num_metrics

            for metric in metrics_in_group:
                normalised = 50
                if university.id in metric_log_values[metric.id]:
                    log_value = metric_log_values[metric.id][university.id]
                    min_log, max_log = metric_log_ranges[metric.id]

                    if max_log - min_log > 0:
                        normalised = (log_value - min_log) / (max_log - min_log) * 100

                    if not metric.is_positive:
                        normalised = 100 - normalised

                    group_metric_scores[metric.name] = round(normalised, 2)
                    group_score += normalised * metric_weight

            # Always include all groups regardless of weight
            all_group_raw_scores[group_id][university.id] = group_score
            group_scores[group_id_to_name[group_id]] = {
                "raw_group_score": group_score,
                "metrics": group_metric_scores,
            }

        university_temp[university.id] = {
            "university": university,
            "group_scores": group_scores
        }

    # Second pass: normalize group scores within each group (0-100 scale)
    for group_id, scores_by_university in all_group_raw_scores.items():
        values = list(scores_by_university.values())
        if not values:
            continue
        min_s, max_s = min(values), max(values)

        for university_id, raw_score in scores_by_university.items():
            if max_s > min_s:
                norm_score = (raw_score - min_s) / (max_s - min_s) * 100
            else:
                norm_score = 50

            group_name = group_id_to_name[group_id]
            university_temp[university_id]["group_scores"][group_name]["group_score"] = round(norm_score, 2)

    # Third pass: compute weighted scores with normalized group scores and final scores
    results = []
    for university_id, data in university_temp.items():
        university = data["university"]
        group_scores = data["group_scores"]
        total_score = 0

        for group_name, g_data in group_scores.items():
            group_id = next((gid for gid, name in group_id_to_name.items() if name == group_name), None)
            weight = group_weights.get(group_id, 0)
            group_score_norm = g_data.get("group_score", 0)
            weighted_score = group_score_norm * weight
            g_data["group_score_weighted"] = round(weighted_score, 2)
            total_score += weighted_score

        final_score = total_score

        results.append({
            "university_id": university.id,
            "university_name": university.name,
            "country_id": university.country_id,
            "city": university.city,
            "final_score": round(final_score, 2),
            "groups": group_scores
        })

    return sorted(results, key=lambda x: x["final_score"], reverse=True)