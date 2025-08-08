import math
from models import db, Country, Metric, MetricGroup, country_metrics

def calculate_scores(group_weights=None):
    countries = Country.query.all()
    metrics = Metric.query.all()
    metric_groups = MetricGroup.query.all()

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
        raw_values = [row.raw_value for row in results]
        log_values = [math.log(v + 1) for v in raw_values]

        metric_log_values[metric.id] = {}
        for row, log_val in zip(results, log_values):
            metric_log_values[metric.id][row.country_id] = log_val

        min_log = min(log_values) if log_values else 0
        max_log = max(log_values) if log_values else 1
        metric_log_ranges[metric.id] = (min_log, max_log)

    results = []
    for country in countries:
        total_score = 0
        group_scores = {}

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
                'group_score': round(group_score, 2),
                'group_score_weighted': round(group_score_weighted, 2),
                'metrics': group_metric_scores
            }
            total_score += group_score_weighted

        results.append({
            'country_id': country.id,
            'country_name': country.name,
            'overall_score': round(total_score, 2),
            'groups': group_scores
        })

    return sorted(results, key=lambda x: x['overall_score'], reverse=True)
