import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import {
  Upload,
  Download,
  FileText,
  Play,
  StopCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  Loader2,
} from 'lucide-react';
import {
  BatchProcessor,
  parseCSV,
  exportBatchResultsCSV,
  generateSampleCSV,
  type BatchResult,
  type BatchSummary,
} from '../services/batchProcessor';
import { useTheme } from '../contexts/ThemeContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useToast } from '../hooks/use-toast';
import { cn } from '../lib/utils';

export function BatchAudit() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processorRef = useRef<BatchProcessor | null>(null);
  const { theme } = useTheme();
  const { toast } = useToast();

  const isDarkMode = theme !== 'light';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResults([]);
      setSummary(null);
    }
  };

  const handleDownloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_audit_template.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: '📄 Template Downloaded',
      description: 'Sample CSV template saved successfully',
      duration: 3000,
    });
  };

  const handleProcessBatch = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResults([]);
    setSummary(null);

    try {
      const text = await file.text();
      const tenders = parseCSV(text);

      toast({
        title: '🚀 Batch Processing Started',
        description: `Processing ${tenders.length} tenders...`,
        duration: 3000,
      });

      const processor = new BatchProcessor();
      processorRef.current = processor;

      const { results: finalResults, summary: finalSummary } = await processor.processBatch(
        tenders,
        {
          onProgress: (progressResults, progressSummary) => {
            setResults(progressResults);
            setSummary(progressSummary);
          },
          saveToHistory: true,
          concurrency: 5, // Fixed at 5 for optimal balance
        }
      );

      setResults(finalResults);
      setSummary(finalSummary);

      toast({
        title: '✅ Batch Processing Complete',
        description: `Successfully audited ${finalSummary.completed} of ${finalSummary.total} tenders`,
        duration: 5000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process batch';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: '❌ Batch Processing Failed',
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
      processorRef.current = null;
    }
  };

  const handleAbort = () => {
    if (processorRef.current) {
      processorRef.current.abort();
      toast({
        title: '⏸️ Processing Aborted',
        description: 'Batch processing has been stopped',
        duration: 3000,
      });
    }
  };

  const handleExportResults = () => {
    if (results.length === 0) return;

    const csv = exportBatchResultsCSV(results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_audit_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: '📊 Results Exported',
      description: 'Batch results saved successfully',
      duration: 3000,
    });
  };

  const getRiskColor = (level: string) => {
    if (level === 'Minimal' || level === 'Low') return '#22c55e';
    if (level === 'Medium') return '#f59e0b';
    return '#ef4444';
  };

  const riskDistribution =
    summary && summary.completed > 0
      ? [
          { name: 'Low Risk', value: summary.lowRiskCount, color: '#22c55e' },
          { name: 'Medium Risk', value: summary.mediumRiskCount, color: '#f59e0b' },
          { name: 'High Risk', value: summary.highRiskCount, color: '#ef4444' },
        ].filter(item => item.value > 0)
      : [];

  const progressPercent = summary
    ? ((summary.completed + summary.failed) / summary.total) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Batch Audit</h2>
        <p className="text-base text-muted-foreground">
          Upload a CSV file to audit multiple tenders simultaneously
        </p>
      </div>

      {/* Upload Section - Side by Side Layout */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: File Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              Select File
            </CardTitle>
            <CardDescription className="text-sm">
              Choose a CSV file containing tender information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!file ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">No file selected</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload a CSV with tender data to begin
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose CSV File
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Alert className="py-2">
                  <FileText className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                  </AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full"
                  size="sm"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Change File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Play className="h-5 w-5" />
              Start Processing
            </CardTitle>
            <CardDescription className="text-sm">
              Process the uploaded file or download a template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Button
                onClick={handleProcessBatch}
                disabled={!file || isProcessing}
                className={cn(
                  "w-full h-11",
                  isDarkMode && "!text-white"
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Batch Audit
                  </>
                )}
              </Button>
              
              {isProcessing && (
                <Button 
                  variant="destructive" 
                  onClick={handleAbort}
                  className="w-full"
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Abort Processing
                </Button>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleDownloadSample}
                disabled={isProcessing}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      {(isProcessing || summary) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Processing Progress
              </span>
              {summary && (
                <Button variant="outline" size="sm" onClick={handleExportResults}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>
                  {summary?.completed || 0} / {summary?.total || 0} completed
                </span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Stats Grid - More Compact */}
            {summary && summary.completed > 0 && (
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold">{summary.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>

                {summary.failed > 0 && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border">
                    <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-xl font-bold">{summary.failed}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border">
                  <TrendingUp className="h-6 w-6 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold">
                      {(summary.avgRisk * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Risk</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border">
                  <DollarSign className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold">
                      {(summary.totalValue / 1e9).toFixed(1)}B
                    </p>
                    <p className="text-xs text-muted-foreground">Total KES</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border">
                  <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold">{summary.highRiskCount}</p>
                    <p className="text-xs text-muted-foreground">High Risk</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border">
                  <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold">{summary.mediumRiskCount}</p>
                    <p className="text-xs text-muted-foreground">Medium Risk</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold">{summary.lowRiskCount}</p>
                    <p className="text-xs text-muted-foreground">Low Risk</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border">
                  <Clock className="h-6 w-6 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold">
                      {(summary.processingTime / 1000).toFixed(1)}s
                    </p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Distribution Chart - More Compact */}
            {riskDistribution.length > 0 && (
              <div className="border border-border rounded-lg p-3">
                <h3 className="text-base font-semibold mb-2">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Audit Results</CardTitle>
            <CardDescription className="text-sm">Detailed results for each tender in the batch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold">Row</th>
                    <th className="text-left py-2 px-3 font-semibold">Tender Title</th>
                    <th className="text-right py-2 px-3 font-semibold">Value (KES)</th>
                    <th className="text-center py-2 px-3 font-semibold">Risk Score</th>
                    <th className="text-center py-2 px-3 font-semibold">Risk Level</th>
                    <th className="text-center py-2 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr
                      key={result.row_number}
                      className="border-b border-border hover:bg-accent/50"
                    >
                      <td className="py-2 px-3">{result.row_number}</td>
                      <td className="py-2 px-3 max-w-xs truncate">
                        {result.input.tender_title}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {result.input.tender_value_kes.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {result.result
                          ? `${(result.result.risk_score * 100).toFixed(1)}%`
                          : '-'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {result.result && (
                          <Badge
                            style={{
                              backgroundColor:
                                getRiskColor(result.result.risk_level) + '20',
                              color: getRiskColor(result.result.risk_level),
                              borderColor: getRiskColor(result.result.risk_level),
                            }}
                            className="border text-xs"
                          >
                            {result.result.risk_level}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {result.status === 'completed' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                        )}
                        {result.status === 'failed' && (
                          <XCircle className="h-4 w-4 text-red-500 inline" />
                        )}
                        {result.status === 'processing' && (
                          <Loader2 className="h-4 w-4 text-blue-500 inline animate-spin" />
                        )}
                        {result.status === 'pending' && (
                          <Clock className="h-4 w-4 text-muted-foreground inline" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
