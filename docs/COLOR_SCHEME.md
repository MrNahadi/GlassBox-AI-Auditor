# Glassbox AI - Color Scheme Reference

## Risk Level Colors

The application uses a consistent color scheme across all components to represent risk levels:

### 🟢 Green - Low Risk (Minimal & Low)

- **Hex Color**: `#22c55e`
- **Tailwind**: `green-600`
- **Used for**:
  - Minimal Risk level (0-20%)
  - Low Risk level (20-40%)
  - Negative SHAP values (features that decrease risk)
  - "Decreases Risk" indicators

### 🟠 Amber/Orange - Medium Risk

- **Hex Color**: `#f59e0b`
- **Tailwind**: `orange-600` / `amber-500`
- **Used for**:
  - Medium Risk level (40-60%)
  - Moderate risk indicators

### 🔴 Red - High Risk (High & Critical)

- **Hex Color**: `#ef4444`
- **Tailwind**: `red-600`
- **Used for**:
  - High Risk level (60-80%)
  - Critical Risk level (80-100%)
  - Positive SHAP values (features that increase risk)
  - "Increases Risk" indicators

## Implementation Details

### Frontend (React/TypeScript)

**src/components/RiskResults.tsx** - Main risk display component:

```typescript
const getRiskColor = (level: string) => {
  // Minimal and Low = Green
  if (level === "Minimal" || level === "Low") return "#22c55e";
  // Medium = Amber/Orange
  if (level === "Medium") return "#f59e0b";
  // High and Critical = Red
  return "#ef4444";
};
```

**Used in**:

- Risk score percentage display
- Pie charts (risk vs. safe)
- Radar charts (top risk factors)
- Risk level text labels

### Backend (Python/FastAPI)

**backend/app/chart_generator.py** - PDF report charts:

```python
if risk_level in ['Minimal', 'Low']:
    risk_color = '#22c55e'  # Green
elif risk_level == 'Medium':
    risk_color = '#f59e0b'  # Amber/Orange
else:  # High or Critical
    risk_color = '#ef4444'  # Red
```

**backend/app/main.py** - PDF report generation:

```python
if report_data.risk_level in ["Minimal", "Low"]:
    risk_color = colors.HexColor('#22c55e')  # Green
elif report_data.risk_level == "Medium":
    risk_color = colors.HexColor('#f59e0b')  # Amber/Orange
else:  # High or Critical
    risk_color = colors.HexColor('#ef4444')  # Red
```

## Risk Score to Level Mapping

| Risk Score | Risk Level | Color    | Description                        |
| ---------- | ---------- | -------- | ---------------------------------- |
| 0-20%      | Minimal    | 🟢 Green | Very low risk, transparent process |
| 20-40%     | Low        | 🟢 Green | Low risk, good indicators          |
| 40-60%     | Medium     | 🟠 Amber | Medium risk, some concerns         |
| 60-80%     | High       | 🔴 Red   | High risk, multiple red flags      |
| 80-100%    | Critical   | 🔴 Red   | Critical risk, major concerns      |

## SHAP Value Colors

SHAP (feature importance) values use a different color logic:

- **Red (`#ef4444`)**: Positive SHAP values - feature increases risk
- **Green (`#22c55e`)**: Negative SHAP values - feature decreases risk

This is independent of the overall risk level and shows the direction of feature impact.

## Components Using Risk Colors

1. **Live Audit Page** (`src/pages/LiveAudit.tsx`)

   - Quick fill buttons use appropriate colors
   - Risk slider gradient from green to red

2. **Risk Results Component** (`src/components/RiskResults.tsx`)

   - Main risk score display
   - Pie chart (risk segment)
   - Radar chart (risk factors)
   - Risk level badge

3. **Dashboard** (`src/pages/Dashboard.tsx`)

   - SHAP value bar chart (red/green for increase/decrease)

4. **PDF Reports** (`backend/app/main.py`, `backend/app/chart_generator.py`)
   - Risk assessment card
   - Radar charts
   - Risk level labels

## Dark Mode

Colors maintain good contrast in both light and dark modes:

- Green `#22c55e` - Works in both modes
- Amber `#f59e0b` - Works in both modes
- Red `#ef4444` - Works in both modes

The Tailwind variants (e.g., `dark:hover:bg-green-950`) provide appropriate hover states.

## Accessibility

All color combinations meet WCAG AA standards for contrast when used with:

- White backgrounds (light mode)
- Dark backgrounds (dark mode)
- Text overlays use appropriate shades

## Future Enhancements

Consider adding:

- Color blind friendly alternative palettes
- User-customizable color schemes
- High contrast mode for accessibility
