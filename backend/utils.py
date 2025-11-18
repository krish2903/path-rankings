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
    """
    Calculates overall country scores based on various weightings.
    (This is your existing function, included for completeness)
    """
    countries = Country.query.all()
    metrics = Metric.query.all()
    metric_groups = MetricGroup.query.all()

    # --- DEFAULT GROUP WEIGHTS ---
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

    # --- LOG TRANSFORMATION + MIN/MAX NORMALISATION (Country) ---
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

    # Discipline and Industry lookups
    country_discipline_map = {
        row.country: list(row.top_disciplines)
        for row in CountryDisciplines.query.all()
    }
    country_industry_map = {
        row.country: list(row.dominant_industries)
        for row in CountryIndustry.query.all()
    }

    # --- SCORE CALCULATION LOGIC (Country) ---
    results = []
    for country in countries:
        total_score = 0
        group_scores = {}

        # ----- METRIC GROUPS SCORING -----
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

            weight = group_weights.get(group_id, 0)
            group_score_weighted = group_score * weight
            group_scores[group_id_to_name[group_id]] = {
                "group_score": round(group_score, 2),
                "group_score_weighted": round(group_score_weighted, 2),
                "metrics": group_metric_scores,
            }
            total_score += group_score_weighted

        # ----- DISCIPLINE AND INDUSTRY SCORING -----
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

        # ----- SCORE WEIGHTINGS -----
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
    """
    Calculates overall university scores based on metric group weightings.
    Applies Log Transformation and Min/Max Normalization (0-100) to raw metric values.
    Ignores discipline and industry logic.
    """
    universities = University.query.all()
    metrics = Metric.query.all()
    metric_groups = MetricGroup.query.all()

    # --- DEFAULT GROUP WEIGHTS ---
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

    # --- LOG TRANSFORMATION + MIN/MAX NORMALISATION (University) ---
    metric_log_ranges = {}
    metric_log_values = {}
    
    # Pre-calculate normalized log values for all university metrics
    for metric in metrics:
        # Fetch all raw values for the current metric from the university_metrics table
        results = db.session.execute(
            university_metrics.select().where(university_metrics.c.metric_id == metric.id)
        ).fetchall()

        raw_values = [row.raw_value for row in results if row.raw_value is not None]
        
        # Apply Log Transformation: log(value + 1)
        log_values = [math.log(v + 1) for v in raw_values]

        # Store log values mapped by university_id
        metric_log_values[metric.id] = {
            row.university_id: log_val 
            for row, log_val in zip(results, log_values)
            if row.raw_value is not None
        }

        # Determine the min and max log values for normalization
        min_log = min(log_values) if log_values else 0
        max_log = max(log_values) if log_values else 1
        metric_log_ranges[metric.id] = (min_log, max_log)

    # --- SCORE CALCULATION LOGIC ---
    results = []
    for university in universities:
        total_score = 0
        group_scores = {}
        
        # ----- METRIC GROUPS SCORING -----
        for group_id, metrics_in_group in group_to_metrics.items():
            group_score = 0
            group_metric_scores = {}
            num_metrics = len(metrics_in_group)
            
            # Skip if no metrics in group or group weight is zero
            weight = group_weights.get(group_id, 0)
            if num_metrics == 0 or weight == 0:
                continue
                
            # Each metric contributes equally within its group
            metric_weight = 1 / num_metrics 

            for metric in metrics_in_group:
                normalised = 50 # Default score if data is missing or range is zero

                if university.id in metric_log_values[metric.id]:
                    log_value = metric_log_values[metric.id][university.id]
                    min_log, max_log = metric_log_ranges[metric.id]
                    
                    # Min/Max Normalisation to 0-100 scale
                    if max_log - min_log > 0:
                        normalised = (log_value - min_log) / (max_log - min_log) * 100
                    
                    # Apply polarity (Is higher value better or worse?)
                    if not metric.is_positive: # e.g., 'career payback period' is negative polarity
                        normalised = 100 - normalised

                    group_metric_scores[metric.name] = round(normalised, 2)
                    group_score += normalised * metric_weight

            # Apply the group weight
            group_score_weighted = group_score * weight
            group_scores[group_id_to_name[group_id]] = {
                "group_score": round(group_score, 2),
                "group_score_weighted": round(group_score_weighted, 2),
                "metrics": group_metric_scores,
            }
            total_score += group_score_weighted
            
        final_score = total_score 

        results.append({
            "university_id": university.id,
            "university_name": university.name,
            "country_id": university.country_id,
            "city": university.city, 
            "final_score": round(final_score, 2),
            "groups": group_scores
        })

    # Sort results by final score in descending order
    return sorted(results, key=lambda x: x["final_score"], reverse=True)