import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { AlertCircle, TrendingUp, FileText, Calculator, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import type { AuditResponse } from '../services/api';

interface RiskResultsProps {
  results: AuditResponse;
}

export function RiskResults({ results }: RiskResultsProps) {
  const { theme } = useTheme();

  const getRiskColor = (level: string) => {
    // Minimal and Low = Green
    if (level === 'Minimal' || level === 'Low') return '#22c55e';
    // Medium = Amber/Orange
    if (level === 'Medium') return '#f59e0b';
    // High and Critical = Red
    return '#ef4444';
  };

  const pieData = [
    { name: 'Risk', value: results.risk_score * 100 },
    { name: 'Safe', value: (1 - results.risk_score) * 100 },
  ];

  const allFeatures = Object.entries(results.shap_values).map(([key, value]) => ({
    feature: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: Math.abs(value),
    fullValue: value,
    isText: key.toLowerCase().includes('text'),
  }));

  const top5Features = allFeatures
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const radarData = top5Features;

  const textFeatures = allFeatures.filter(f => f.isText);
  const numericFeatures = allFeatures.filter(f => !f.isText);

  const textImpact = textFeatures.reduce((sum, f) => sum + Math.abs(f.fullValue), 0);
  const numericImpact = numericFeatures.reduce((sum, f) => sum + Math.abs(f.fullValue), 0);
  const totalImpact = textImpact + numericImpact;

  const textPercentage = totalImpact > 0 ? (textImpact / totalImpact) * 100 : 0;
  const numericPercentage = totalImpact > 0 ? (numericImpact / totalImpact) * 100 : 0;

  const contributionData = [
    { name: 'Text Features', value: textPercentage },
    { name: 'Numeric Features', value: numericPercentage },
  ];

  const chartColors = {
    risk: getRiskColor(results.risk_level),
    safe: theme === 'dark' ? '#374151' : '#e5e7eb',
    radar: getRiskColor(results.risk_level),
    grid: theme === 'dark' ? '#4b5563' : '#d1d5db',
    text: theme === 'dark' ? '#e5e7eb' : '#374151',
    textFeature: '#3b82f6',
    numericFeature: '#8b5cf6',
  };

  const getFeatureColor = (value: number) => {
    return value > 0 ? '#ef4444' : '#22c55e';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2" style={{ color: chartColors.risk }}>
              {(results.risk_score * 100).toFixed(1)}%
            </div>
            <div className="text-xl font-semibold text-muted-foreground">
              {results.risk_level} Risk
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                <Cell fill={chartColors.risk} />
                <Cell fill={chartColors.safe} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Factor Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Showing top 5 factors by impact</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={chartColors.grid} />
              <PolarAngleAxis
                dataKey="feature"
                tick={{ fill: chartColors.text, fontSize: 13 }}
              />
              <PolarRadiusAxis tick={{ fill: chartColors.text }} />
              <Radar
                name="Impact"
                dataKey="value"
                stroke={chartColors.radar}
                fill={chartColors.radar}
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${chartColors.grid}`,
                  borderRadius: '8px',
                }}
                labelStyle={{ color: chartColors.text }}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Top 5 Risk Contributors:</p>
            <div className="space-y-2">
              {top5Features.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    {item.isText ? (
                      <FileText className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Calculator className="h-4 w-4 text-purple-500" />
                    )}
                    <span className="text-sm text-foreground">{item.feature}</span>
                  </div>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: getFeatureColor(item.fullValue) }}
                  >
                    {item.fullValue > 0 ? '+' : ''}{item.fullValue.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Feature Contribution Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={contributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  >
                    <Cell fill={chartColors.textFeature} />
                    <Cell fill={chartColors.numericFeature} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 rounded-lg border border-border bg-blue-50 dark:bg-blue-950/20">
                <FileText className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Text Features</p>
                <p className="text-2xl font-bold text-foreground">{textPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">{textFeatures.length} factors</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg border border-border bg-purple-50 dark:bg-purple-950/20">
                <Calculator className="h-8 w-8 text-purple-500 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Numeric Features</p>
                <p className="text-2xl font-bold text-foreground">{numericPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">{numericFeatures.length} factors</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.interpretation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Auditor's Summary
              <Badge variant="secondary" className="ml-2">
                Powered by Gemini
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {results.interpretation.split('\n').map((line, idx) => (
                line.trim() && <p key={idx} className="text-foreground">{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results.error && !results.interpretation && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            AI Auditor's Summary is currently unavailable. The risk assessment above is still accurate.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
