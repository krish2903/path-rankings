import math
from models import (
    db,
    Country,
    Metric,
    MetricGroup,
    country_metrics,
    CountryIndustry,
    CountryDisciplines
)

def calculate_scores(group_weights=None, selected_disciplines=None, selected_industries=None):
    countries = Country.query.all()
    metrics = Metric.query.all()
    metric_groups = MetricGroup.query.all()

    # --- Setup default group weights if none provided ---
    if group_weights is None:
        group_weights = {}
        total_groups = len(metric_groups)
        for group in metric_groups:
            group_weights[group.id] = 1.0 / total_groups

    # --- Map group → metrics and store names ---
    group_to_metrics = {}
    group_id_to_name = {}
    for mg in metric_groups:
        group_to_metrics[mg.id] = [m for m in metrics if m.group_id == mg.id]
        group_id_to_name[mg.id] = mg.name

    # --- Pre-calculate logs and ranges for all metrics ---
    metric_log_ranges = {}
    metric_log_values = {}
    for metric in metrics:
        results = db.session.execute(
            country_metrics.select().where(country_metrics.c.metric_id == metric.id)
        ).fetchall()

        raw_values = [row.raw_value for row in results]
        log_values = [math.log(v + 1) for v in raw_values]

        metric_log_values[metric.id] = {
            row.country_id: log_val for row, log_val in zip(results, log_values)
        }

        min_log = min(log_values) if log_values else 0
        max_log = max(log_values) if log_values else 1
        metric_log_ranges[metric.id] = (min_log, max_log)

    # --- Build lookups for disciplines & industries ---
    country_discipline_map = {
        row.country: list(row.top_disciplines)
        for row in CountryDisciplines.query.all()
    }
    country_industry_map = {
        row.country: list(row.dominant_industries)   # only dominant industries
        for row in CountryIndustry.query.all()
    }

    # --- Calculate scores per country ---
    results = []
    for country in countries:
        total_score = 0
        group_scores = {}

        # ----- Metric Group Scoring -----
        for group_id, metrics_in_group in group_to_metrics.items():
            group_score = 0
            group_metric_scores = {}
            num_metrics = len(metrics_in_group)
            if num_metrics == 0:
                continue
            metric_weight = 1 / num_metrics

            for metric in metrics_in_group:
                if country.id in metric_log_values[metric.id]:
                    log_value = metric_log_values[metric.id][country.id]
                    min_log, max_log = metric_log_ranges[metric.id]
                    if max_log - min_log > 0:
                        normalised = (log_value - min_log) / (max_log - min_log) * 100
                    else:
                        normalised = 50

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

        # ----- Discipline Score -----
        discipline_score = 0
        if selected_disciplines:
            top_disciplines = country_discipline_map.get(country.name, [])
            N = len(top_disciplines)
            if N > 0:
                for sel in selected_disciplines:
                    if sel in top_disciplines:
                        i = top_disciplines.index(sel)
                        discipline_score += 100 - 20 * i

        # ----- Industry Score -----
        industry_score = 0
        if selected_industries:
            top_dominant = country_industry_map.get(country.name, [])
            N = len(top_dominant)
            if N > 0:
                for sel in selected_industries:
                    if sel in top_dominant:
                        i = top_dominant.index(sel)
                        industry_score += 100 - 20 * i

        # ----- Apply weighting rules -----
        has_disciplines = bool(selected_disciplines and len(selected_disciplines) > 0)
        has_industries = bool(selected_industries and len(selected_industries) > 0)

        if not has_disciplines and not has_industries:
            overall_weight = 1.0
            discipline_weight = 0.0
            industry_weight = 0.0
        elif has_disciplines and not has_industries:
            overall_weight = 0.8
            discipline_weight = 0.2
            industry_weight = 0.0
        elif not has_disciplines and has_industries:
            overall_weight = 0.8
            discipline_weight = 0.0
            industry_weight = 0.2
        else:  # both selected
            overall_weight = 0.8
            discipline_weight = 0.1
            industry_weight = 0.1

        final_score = (
            total_score * overall_weight
            + discipline_score * discipline_weight
            + industry_score * industry_weight
        )

        results.append({
            "country_id": country.id,
            "country_name": country.name,
            # raw component scores
            "overall_score": round(total_score, 2),
            "discipline_score": round(discipline_score, 2),
            "industry_score": round(industry_score, 2),
            # weighted score for ranking
            "final_score": round(final_score, 2),
            "groups": group_scores
        })

    # Sort by final_score
    return sorted(results, key=lambda x: x["final_score"], reverse=True)
