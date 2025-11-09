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
  
  // Check if current theme is dark mode
  const isDarkMode = theme !== 'light';

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
          // Truncate long names for better display
          const shortName = displayName.length > 35 ? displayName.substring(0, 32) + '...' : displayName;
          return {
            name: shortName,
            fullName: displayName,
            value: value,
            absValue: Math.abs(value),
            isText: key.toLowerCase().includes('text'),
          };
        })
    : [];

  const chartColors = {
    positive: isDarkMode ? '#ef4444' : '#dc2626',
    negative: isDarkMode ? '#22c55e' : '#16a34a',
    grid: isDarkMode ? '#374151' : '#e5e7eb',
    text: isDarkMode ? '#e5e7eb' : '#374151',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-80" />
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Model Transparency Dashboard</h2>
        <p className="text-base text-muted-foreground">
          Performance metrics and insights into how the AI model assesses tender risks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {((stats?.model_accuracy || 0) * 100).toFixed(2)}%
            </div>
            <p className="text-base text-muted-foreground mt-1">
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
            <p className="text-base text-muted-foreground mt-1">
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
            <p className="text-base text-muted-foreground mt-1">
              Synthetic tender records
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Risk Factors (SHAP Importance)</CardTitle>
          <CardDescription>
            Mean SHAP values across training data - Red bars increase risk, Green bars decrease risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-base text-muted-foreground">
              Diverging bar chart showing the average impact of each feature on risk predictions across all training data. 
              Red bars increase risk (positive SHAP), green bars decrease risk (negative SHAP).
            </p>
            
            <ResponsiveContainer width="100%" height={360}>
              <BarChart 
                data={chartData} 
                layout="vertical" 
                margin={{ left: 20, right: 20, top: 5, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
                <XAxis
                  type="number"
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  label={{ 
                    value: 'Mean SHAP Value (Average Impact on Risk Score)', 
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
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value >= 0 ? '#ef4444' : '#22c55e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-base text-muted-foreground">
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
              <span>📝</span>
              <span>Text Features</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📊</span>
              <span>Numeric Features</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="text-lg font-semibold text-foreground">Understanding the Metrics</h4>
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-border p-3 space-y-1">
                <p className="font-medium text-foreground">Model Accuracy</p>
                <p className="text-base text-muted-foreground">
                  The percentage of tenders correctly classified during testing. Our model achieves {((stats?.model_accuracy || 0) * 100).toFixed(1)}% accuracy.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1">
                <p className="font-medium text-foreground">AUC Score</p>
                <p className="text-base text-muted-foreground">
                  Area Under the ROC Curve - measures how well the model distinguishes between risk levels. A score above 90% is excellent.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1 lg:col-span-2">
                <p className="font-medium text-foreground">SHAP Values Explained</p>
                <p className="text-base text-muted-foreground">
                  SHAP (SHapley Additive exPlanations) values show the average impact each feature has on risk predictions across all training data. 
                  <strong className="text-red-600 dark:text-red-400"> Positive values (red bars)</strong> indicate features that typically increase risk scores, 
                  while <strong className="text-green-600 dark:text-green-400">negative values (green bars)</strong> indicate features that typically decrease risk scores. 
                  The length of each bar shows the magnitude of impact - longer bars mean stronger influence on the model's decisions.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1 bg-blue-50 dark:bg-blue-950/20 lg:col-span-2">
                <p className="font-medium text-foreground">💡 How to Read This Chart</p>
                <p className="text-base text-muted-foreground">
                  <strong>Diverging bars show direction:</strong> This chart displays both the direction and magnitude of each feature's average impact. 
                  Features on the right (red) generally push risk scores higher, while features on the left (green) generally push scores lower.
                  <strong className="block mt-1">📝 Text features:</strong> Derived from tender description analysis using natural language processing.
                  <strong className="block">📊 Numeric features:</strong> Direct quantitative values like tender value, number of bidders, project duration, and complexity scores.
                  <strong className="block mt-1">Note:</strong> These are <em>average</em> SHAP values across all training data. For individual tender audits, you'll see specific SHAP values showing exactly how each feature influenced that particular tender's risk score.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
