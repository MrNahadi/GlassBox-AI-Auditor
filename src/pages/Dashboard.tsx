import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { AlertCircle, Award, Target, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { getModelStats, type ModelStats } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

export function Dashboard() {
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getModelStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load model statistics. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = stats
    ? Object.entries(stats.global_feature_importance || stats.average_shap_values || {})
        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
        .slice(0, 10)
        .map(([key, value]) => {
          let displayName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          if (displayName.startsWith('Text')) {
            displayName = displayName.replace('Text', '📝');
          }
          return {
            name: displayName,
            value: value,
            absValue: Math.abs(value),
            isText: key.toLowerCase().includes('text'),
          };
        })
    : [];

  const chartColors = {
    positive: theme === 'dark' ? '#ef4444' : '#dc2626',
    negative: theme === 'dark' ? '#22c55e' : '#16a34a',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    text: theme === 'dark' ? '#e5e7eb' : '#374151',
  };

  const getBarColor = (value: number) => {
    return value >= 0 ? chartColors.positive : chartColors.negative;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Model Transparency Dashboard</h2>
        <p className="text-muted-foreground">
          Performance metrics and insights into how the AI model assesses tender risks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {((stats?.model_accuracy || 0) * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Correct predictions on test data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AUC Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {((stats?.model_auc_score || 0) * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Model discrimination ability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Dataset</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {(stats?.total_tenders_trained_on || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Synthetic tender records
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Risk Factors (SHAP Values)</CardTitle>
          <CardDescription>
            Diverging bar chart: Red bars increase risk (positive SHAP), green bars decrease risk (negative SHAP)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 150, right: 30, top: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
              <XAxis
                type="number"
                tick={{ fill: chartColors.text, fontSize: 12 }}
                label={{ value: 'SHAP Value (Impact on Risk)', position: 'bottom', fill: chartColors.text, offset: 0 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: chartColors.text, fontSize: 13 }}
                width={140}
              />
              <ReferenceLine x={0} stroke={chartColors.text} strokeWidth={2} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${chartColors.grid}`,
                  borderRadius: '8px',
                  padding: '12px',
                }}
                labelStyle={{ color: chartColors.text, fontWeight: 'bold', marginBottom: '4px' }}
                formatter={(value: number) => [
                  `${value > 0 ? '+' : ''}${value.toFixed(4)}`,
                  value >= 0 ? 'Increases Risk' : 'Decreases Risk'
                ]}
              />
              <Bar
                dataKey="value"
                radius={8}
                barSize={32}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: chartColors.positive }}></div>
              <span>Increases Risk (Positive SHAP)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: chartColors.negative }}></div>
              <span>Decreases Risk (Negative SHAP)</span>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-center gap-2">
              <span>📝</span>
              <span>Text Features</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📊</span>
              <span>Numeric Features</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Understanding the Metrics</h4>
            <div className="grid gap-3 text-sm">
              <div className="rounded-lg border border-border p-3">
                <p className="font-medium text-foreground mb-1">Model Accuracy</p>
                <p className="text-muted-foreground">
                  The percentage of tenders correctly classified during testing. Our model achieves {((stats?.model_accuracy || 0) * 100).toFixed(1)}% accuracy.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="font-medium text-foreground mb-1">AUC Score</p>
                <p className="text-muted-foreground">
                  Area Under the ROC Curve - measures how well the model distinguishes between risk levels. A score above 90% is excellent.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="font-medium text-foreground mb-1">SHAP Values Explained</p>
                <p className="text-muted-foreground">
                  SHAP (SHapley Additive exPlanations) values show how each feature pushes the risk score up (positive/red) or down (negative/green). 
                  This diverging bar chart displays the average SHAP impact across all predictions in the training data. 
                  Features extending right increase risk, while those extending left decrease risk. Only the top 10 most impactful features are shown.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3 bg-blue-50 dark:bg-blue-950/20">
                <p className="font-medium text-foreground mb-1">💡 How to Read This Chart</p>
                <p className="text-muted-foreground">
                  <strong>Positive (Red) bars:</strong> Features that typically increase risk scores. For example, high tender values or PEP involvement push predictions toward "High Risk".<br/>
                  <strong>Negative (Green) bars:</strong> Features that typically decrease risk scores. For example, many bidders or low complexity push predictions toward "Low Risk".<br/>
                  <strong>Length = Impact:</strong> Longer bars (regardless of direction) indicate features with stronger influence on the model's decisions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
