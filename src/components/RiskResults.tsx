import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { AlertCircle, TrendingUp, FileText, Calculator, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import type { AuditResponse } from '../services/api';

interface RiskResultsProps {
  results: AuditResponse;
}

export function RiskResults({ results }: RiskResultsProps) {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Check if current theme is dark mode (dark, slate, midnight, ocean)
  const isDarkMode = theme !== 'light';

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

  const chartColors = {
    risk: getRiskColor(results.risk_level),
    safe: isDarkMode ? '#374151' : '#e5e7eb',
    radar: getRiskColor(results.risk_level),
    grid: isDarkMode ? '#4b5563' : '#d1d5db',
    text: isDarkMode ? '#e5e7eb' : '#374151',
  };

  const getFeatureColor = (value: number) => {
    return value > 0 ? '#ef4444' : '#22c55e';
  };

  return (
    <div 
      className={`space-y-3 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Combined Risk Overview - Side by Side */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-4 w-4" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-3">
              <div 
                className="text-4xl font-bold mb-1 transition-all duration-1000 animate-in fade-in slide-in-from-bottom-4" 
                style={{ color: chartColors.risk }}
              >
                {(results.risk_score * 100).toFixed(1)}%
              </div>
              <div className="text-lg font-semibold text-muted-foreground animate-in fade-in slide-in-from-bottom-2 delay-150">
                {results.risk_level} Risk
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
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
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Risk Factor Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <p className="text-xs text-muted-foreground">Showing top 5 factors by impact</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={chartColors.grid} />
                <PolarAngleAxis
                  dataKey="feature"
                  tick={{ fill: chartColors.text, fontSize: 10 }}
                />
                <PolarRadiusAxis tick={{ fill: chartColors.text, fontSize: 9 }} />
                <Radar
                  name="Impact"
                  dataKey="value"
                  stroke={chartColors.radar}
                  fill={chartColors.radar}
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                  }}
                  labelStyle={{ 
                    color: isDarkMode ? '#f9fafb' : '#1f2937',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>

            <div className="mt-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Top 5 Risk Contributors:</p>
              <div className="space-y-1.5">
                {top5Features.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      {item.isText ? (
                        <FileText className="h-3.5 w-3.5 text-blue-500" />
                      ) : (
                        <Calculator className="h-3.5 w-3.5 text-purple-500" />
                      )}
                      <span className="text-xs text-foreground">{item.feature}</span>
                    </div>
                    <span
                      className="font-semibold text-xs"
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
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-4 w-4" />
            SHAP Feature Impact for This Tender
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Diverging bar chart showing how each feature influenced this tender's risk score. 
              Red bars increase risk (positive SHAP), green bars decrease risk (negative SHAP).
              Hover over bars to see feature names and values.
            </p>
            
            <ResponsiveContainer width="100%" height={340}>
              <BarChart 
                data={allFeatures
                  .sort((a, b) => Math.abs(b.fullValue) - Math.abs(a.fullValue))
                  .slice(0, 10)
                  .map(f => ({
                    name: f.feature.length > 35 ? f.feature.substring(0, 32) + '...' : f.feature,
                    fullName: f.feature,
                    value: f.fullValue,
                    isText: f.isText
                  }))
                } 
                layout="vertical" 
                margin={{ left: 20, right: 20, top: 5, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
                <XAxis 
                  type="number"
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  label={{ 
                    value: 'SHAP Value (Impact on Risk)', 
                    position: 'bottom', 
                    fill: chartColors.text,
                    offset: 0,
                    fontSize: 12
                  }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  hide={true}
                />
                <ReferenceLine x={0} stroke={chartColors.text} strokeWidth={2} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                  }}
                  labelStyle={{ 
                    color: isDarkMode ? '#f9fafb' : '#1f2937', 
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}
                  itemStyle={{
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                  }}
                  formatter={(value: number) => [
                    `${value > 0 ? '+' : ''}${value.toFixed(4)}`,
                    value >= 0 ? 'Increases Risk' : 'Decreases Risk'
                  ]}
                  labelFormatter={(label: string, payload: any) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                />
                <Bar dataKey="value" barSize={18} radius={[8, 8, 8, 8]}>
                  {allFeatures
                    .sort((a, b) => Math.abs(b.fullValue) - Math.abs(a.fullValue))
                    .slice(0, 10)
                    .map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.fullValue >= 0 ? '#ef4444' : '#22c55e'}
                      />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span>Increases Risk (Positive SHAP)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                <span>Decreases Risk (Negative SHAP)</span>
              </div>
              <div className="h-4 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Text Features</span>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-purple-500" />
                <span>Numeric Features</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 rounded-lg border border-border bg-blue-50 dark:bg-blue-950/20">
                <FileText className="h-6 w-6 text-blue-500 mb-1" />
                <p className="text-xs font-medium text-muted-foreground">Text Impact</p>
                <p className="text-lg font-bold text-foreground">{textPercentage.toFixed(1)}%</p>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg border border-border bg-purple-50 dark:bg-purple-950/20">
                <Calculator className="h-6 w-6 text-purple-500 mb-1" />
                <p className="text-xs font-medium text-muted-foreground">Numeric Impact</p>
                <p className="text-lg font-bold text-foreground">{numericPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.interpretation && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-4 w-4" />
              AI Auditor's Summary
              <Badge variant="secondary" className="ml-2 text-xs">
                Powered by Gemini
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
              {results.interpretation.split('\n').map((line, idx) => (
                line.trim() && <p key={idx} className="text-foreground mb-2">{line}</p>
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
