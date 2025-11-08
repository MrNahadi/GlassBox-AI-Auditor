import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO

def generate_radar_chart(shap_values: dict, risk_level: str) -> BytesIO:
    top_features = sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)[:5]

    if len(top_features) == 0:
        top_features = [('No Data', 0)]

    labels = [name.replace('_', ' ').title() for name, _ in top_features]
    values = [abs(value) for _, value in top_features]

    num_vars = len(labels)
    angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
    values += values[:1]
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))

    # Color scheme: Green for Minimal/Low, Amber for Medium, Red for High/Critical
    if risk_level in ['Minimal', 'Low']:
        risk_color = '#22c55e'  # Green
    elif risk_level == 'Medium':
        risk_color = '#f59e0b'  # Amber/Orange
    else:  # High or Critical
        risk_color = '#ef4444'  # Red

    ax.plot(angles, values, 'o-', linewidth=2, color=risk_color, label='Impact')
    ax.fill(angles, values, alpha=0.25, color=risk_color)
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(labels, size=10)
    ax.set_ylim(0, max(values) * 1.2 if max(values) > 0 else 1)
    ax.set_title('Top 5 Risk Factors', size=14, weight='bold', pad=20)
    ax.grid(True, linestyle='--', alpha=0.7)

    plt.tight_layout()

    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    plt.close(fig)

    return buffer

def generate_contribution_chart(text_percentage: float, numeric_percentage: float) -> BytesIO:
    labels = ['Text Features', 'Numeric Features']
    sizes = [text_percentage, numeric_percentage]
    colors = ['#3b82f6', '#8b5cf6']

    fig, ax = plt.subplots(figsize=(8, 6))

    wedges, texts, autotexts = ax.pie(
        sizes,
        labels=labels,
        colors=colors,
        autopct='%1.1f%%',
        startangle=90,
        textprops={'size': 12}
    )

    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_weight('bold')
        autotext.set_size(14)

    ax.set_title('Feature Contribution Breakdown', size=14, weight='bold', pad=20)

    plt.tight_layout()

    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    plt.close(fig)

    return buffer
