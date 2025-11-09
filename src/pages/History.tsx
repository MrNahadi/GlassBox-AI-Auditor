import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  History as HistoryIcon, 
  Download, 
  Trash2, 
  Search, 
  TrendingUp, 
  Calendar,
  DollarSign,
  AlertCircle,
  BarChart3,
  FileText,
  Eye,
} from 'lucide-react';
import { auditHistory, type AuditRecord } from '../services/auditHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export function History() {
  const [records, setRecords] = useState<AuditRecord[]>(auditHistory.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isDarkMode = theme !== 'light';

  const stats = auditHistory.getStats();
  const trendData = auditHistory.getRiskTrend(30);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = record.input.tender_title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = filterRisk === 'all' || record.result.risk_level.toLowerCase() === filterRisk.toLowerCase();
      return matchesSearch && matchesRisk;
    });
  }, [records, searchQuery, filterRisk]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this audit record?')) {
      auditHistory.delete(id);
      setRecords(auditHistory.getAll());
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL audit history? This cannot be undone.')) {
      auditHistory.clear();
      setRecords([]);
    }
  };

  const handleExportJSON = () => {
    const data = auditHistory.exportToJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glassbox_audit_history_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const data = auditHistory.exportToCSV();
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glassbox_audit_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewAudit = (record: AuditRecord) => {
    // Store selected audit in sessionStorage and navigate
    sessionStorage.setItem('selected_audit', JSON.stringify(record));
    navigate('/', { state: { loadAudit: record } });
  };

  const getRiskColor = (level: string) => {
    if (level === 'Minimal' || level === 'Low') return '#22c55e';
    if (level === 'Medium') return '#f59e0b';
    return '#ef4444';
  };

  const riskDistribution = [
    { name: 'Low Risk', value: stats.lowRiskCount, color: '#22c55e' },
    { name: 'Medium Risk', value: stats.mediumRiskCount, color: '#f59e0b' },
    { name: 'High Risk', value: stats.highRiskCount, color: '#ef4444' },
  ].filter(item => item.value > 0);

  if (records.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Audit History</h2>
          <p className="text-base text-muted-foreground">
            Track and analyze all your tender audits over time
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No audit history yet. Start auditing tenders to build your history and unlock powerful analytics!
          </AlertDescription>
        </Alert>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HistoryIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Audits Found</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Your audit history will appear here. Conduct your first audit to start tracking trends and building institutional knowledge.
            </p>
            <Button onClick={() => navigate('/')}>
              <FileText className="mr-2 h-4 w-4" />
              Start Your First Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Audit History</h2>
          <p className="text-base text-muted-foreground">
            {stats.total} audits tracked • {stats.totalValue.toLocaleString()} KES total value
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJSON}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearAll}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
            <HistoryIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats.avgRisk * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all audits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Tenders</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.highRiskCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.highRiskCount / stats.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(stats.totalValue / 1e9).toFixed(1)}B
            </div>
            <p className="text-xs text-muted-foreground mt-1">KES audited</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Risk Trend (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontSize: 11 }}
                  />
                  <YAxis 
                    tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontSize: 11 }}
                    domain={[0, 1]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [(value * 100).toFixed(1) + '%', 'Avg Risk']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgRisk" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data for the last 30 days
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Records</CardTitle>
          <CardDescription>
            Search and filter through your audit history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by tender title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-4 py-2 pr-10 rounded-md border border-input bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value="all">All Risk Levels</option>
              <option value="minimal">Minimal</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No audits match your search criteria
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {record.input.tender_title}
                      </h3>
                      <Badge
                        style={{
                          backgroundColor: getRiskColor(record.result.risk_level) + '20',
                          color: getRiskColor(record.result.risk_level),
                          borderColor: getRiskColor(record.result.risk_level),
                        }}
                        className="border"
                      >
                        {record.result.risk_level}
                      </Badge>
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {record.input.tender_value_kes.toLocaleString()} KES
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {(record.result.risk_score * 100).toFixed(1)}% Risk
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAudit(record)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
