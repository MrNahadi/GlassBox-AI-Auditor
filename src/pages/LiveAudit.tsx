import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, FileText, Loader2, Shuffle, Sliders } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AuditProgress } from '../components/ui/audit-progress';
import { useToast } from '../hooks/use-toast';
import { auditTender, generateReport, type AuditResponse, type TenderInput } from '../services/api';
import { RiskResults } from '../components/RiskResults';

const tenderSchema = z.object({
  tender_title: z.string().min(1, 'Tender title is required').max(500),
  tender_value_kes: z.coerce.number().positive('Value must be positive').max(1e12),
  number_of_bidders: z.coerce.number().int().min(1).max(100),
  project_duration_days: z.coerce.number().int().min(1).max(3650),
  process_complexity: z.number().int().min(1).max(10),
  pep_involvement: z.boolean(),
  tender_description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
});

type TenderFormData = z.infer<typeof tenderSchema>;

const tenderTitles = [
  'Road Construction Project',
  'Hospital Equipment Procurement',
  'School Infrastructure Development',
  'Water Supply System Upgrade',
  'IT Systems Modernization',
  'Bridge Rehabilitation Project',
  'Public Transport Fleet Acquisition',
  'Police Station Construction',
  'Agricultural Equipment Supply',
  'Street Lighting Installation',
];

export function LiveAudit() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AuditResponse | null>(null);
  const [formData, setFormData] = useState<TenderInput | null>(null);
  const [complexity, setComplexity] = useState(5);
  const [riskMode, setRiskMode] = useState<'button' | 'slider'>('button');
  const [targetRiskLevel, setTargetRiskLevel] = useState(50);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<TenderFormData>({
    resolver: zodResolver(tenderSchema),
    defaultValues: {
      process_complexity: 5,
      pep_involvement: false,
    },
  });

  const onSubmit = async (data: TenderFormData) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const input: TenderInput = {
        ...data,
        process_complexity: complexity,
      };
      setFormData(input);
      const response = await auditTender(input);
      setResults(response);
      
      // Show success toast
      toast({
        title: "✅ Audit Complete!",
        description: `Risk Level: ${response.risk_level} (${(response.risk_score * 100).toFixed(1)}%)`,
        duration: 5000,
      });
      
      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError('Failed to audit tender. Please ensure the backend server is running.');
      toast({
        variant: "destructive",
        title: "❌ Audit Failed",
        description: "Could not connect to the backend server. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomValues = (targetRisk?: 'low' | 'medium' | 'high') => {
    const title = tenderTitles[Math.floor(Math.random() * tenderTitles.length)];

    let value, bidders, duration, complexityVal, pepInvolvement, description;

    const safeDescriptions = [
      'Standard procurement with open competitive bidding process following all regulations',
      'Regular public tender with transparent evaluation and multiple qualified bidders',
      'Competitive tender process with adequate preparation time and fair evaluation criteria',
    ];

    const riskyDescriptions = [
      'Urgent sole-source procurement without competitive bidding due to emergency circumstances',
      'Expedited tender with limited competition and restricted participation requirements',
      'Direct consulting engagement bypassing standard competitive procedures for specialized services',
    ];

    if (targetRisk === 'low') {
      value = Math.floor(Math.random() * 10000000) + 500000;
      bidders = Math.floor(Math.random() * 6) + 5;
      duration = Math.floor(Math.random() * 90) + 30;
      complexityVal = Math.floor(Math.random() * 3) + 1;
      pepInvolvement = false;
      description = safeDescriptions[Math.floor(Math.random() * safeDescriptions.length)];
    } else if (targetRisk === 'high') {
      value = Math.floor(Math.random() * 500000000) + 100000000;
      bidders = Math.floor(Math.random() * 2) + 1;
      duration = Math.floor(Math.random() * 365) + 180;
      complexityVal = Math.floor(Math.random() * 3) + 8;
      pepInvolvement = Math.random() > 0.3;
      description = riskyDescriptions[Math.floor(Math.random() * riskyDescriptions.length)];
    } else if (targetRisk === 'medium') {
      value = Math.floor(Math.random() * 50000000) + 10000000;
      bidders = Math.floor(Math.random() * 4) + 3;
      duration = Math.floor(Math.random() * 150) + 60;
      complexityVal = Math.floor(Math.random() * 4) + 4;
      pepInvolvement = Math.random() > 0.7;
      description = Math.random() > 0.5 ? safeDescriptions[0] + ' with expedited timeline' : safeDescriptions[1];
    } else {
      value = Math.floor(Math.random() * 100000000) + 100000;
      bidders = Math.floor(Math.random() * 15) + 1;
      duration = Math.floor(Math.random() * 500) + 30;
      complexityVal = Math.floor(Math.random() * 10) + 1;
      pepInvolvement = Math.random() > 0.5;
      description = safeDescriptions[Math.floor(Math.random() * safeDescriptions.length)];
    }

    setValue('tender_title', title);
    setValue('tender_value_kes', value);
    setValue('number_of_bidders', bidders);
    setValue('project_duration_days', duration);
    setValue('process_complexity', complexityVal);
    setValue('pep_involvement', pepInvolvement);
    setValue('tender_description', description);
    setComplexity(complexityVal);
  };

  const generateByRiskSlider = () => {
    if (targetRiskLevel < 30) {
      generateRandomValues('low');
    } else if (targetRiskLevel > 70) {
      generateRandomValues('high');
    } else {
      generateRandomValues('medium');
    }
  };

  const handleDownloadReport = async () => {
    if (!results || !formData) return;

    try {
      const reportData = {
        ...formData,
        risk_score: results.risk_score,
        risk_level: results.risk_level,
        interpretation: results.interpretation,
        text_analysis: results.text_analysis,
        shap_values: results.shap_values,
        text_contribution_percentage: results.text_contribution_percentage,
        numeric_contribution_percentage: results.numeric_contribution_percentage,
        timestamp: new Date().toLocaleString(),
      };

      const blob = await generateReport(reportData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_report_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "📄 Report Downloaded!",
        description: "Your audit report has been saved successfully.",
        duration: 3000,
      });
    } catch (err) {
      setError('Failed to generate report');
      toast({
        variant: "destructive",
        title: "❌ Download Failed",
        description: "Could not generate the PDF report. Please try again.",
        duration: 5000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Live Tender Audit</h2>
        <p className="text-sm text-muted-foreground">
          Enter tender details to receive an immediate risk assessment with AI-powered insights.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Tender Information</CardTitle>
            <CardDescription className="text-sm">Fill in the details of the tender to audit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Quick Fill</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRiskMode(riskMode === 'button' ? 'slider' : 'button')}
                >
                  <Sliders className="h-4 w-4 mr-2" />
                  {riskMode === 'button' ? 'Use Slider' : 'Use Buttons'}
                </Button>
              </div>

              {riskMode === 'button' ? (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => generateRandomValues('low')}
                    disabled={isLoading}
                    className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    <Shuffle className="h-4 w-4 mr-1" />
                    Low Risk
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => generateRandomValues('medium')}
                    disabled={isLoading}
                    className="text-orange-600 border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                  >
                    <Shuffle className="h-4 w-4 mr-1" />
                    Medium
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => generateRandomValues('high')}
                    disabled={isLoading}
                    className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Shuffle className="h-4 w-4 mr-1" />
                    High Risk
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-medium">Low Risk</span>
                    <span className="text-muted-foreground">{targetRiskLevel}%</span>
                    <span className="text-red-600 font-medium">High Risk</span>
                  </div>
                  <Slider
                    value={[targetRiskLevel]}
                    onValueChange={([value]) => setTargetRiskLevel(value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateByRiskSlider}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Generate Random Tender
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t border-border my-4"></div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tender_title" className="text-sm">Tender Title</Label>
                <Input
                  id="tender_title"
                  placeholder="e.g., Road Construction Project"
                  {...register('tender_title')}
                  disabled={isLoading}
                  className="h-9"
                />
                {errors.tender_title && (
                  <p className="text-xs text-destructive">{errors.tender_title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tender_description" className="text-sm">Tender Description</Label>
                <Textarea
                  id="tender_description"
                  placeholder="Describe the procurement process, timeline, and any special circumstances..."
                  {...register('tender_description')}
                  disabled={isLoading}
                  rows={3}
                  className="resize-none text-sm"
                />
                {errors.tender_description && (
                  <p className="text-xs text-destructive">{errors.tender_description.message}</p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="tender_value_kes" className="text-sm">Tender Value (KES)</Label>
                  <Input
                    id="tender_value_kes"
                    type="number"
                    placeholder="e.g., 5000000"
                    {...register('tender_value_kes')}
                    disabled={isLoading}
                    className="h-9"
                  />
                  {errors.tender_value_kes && (
                    <p className="text-xs text-destructive">{errors.tender_value_kes.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="number_of_bidders" className="text-sm">Number of Bidders</Label>
                  <Input
                    id="number_of_bidders"
                    type="number"
                    placeholder="e.g., 5"
                    {...register('number_of_bidders')}
                    disabled={isLoading}
                    className="h-9"
                  />
                  {errors.number_of_bidders && (
                    <p className="text-xs text-destructive">{errors.number_of_bidders.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="project_duration_days" className="text-sm">Project Duration (Days)</Label>
                <Input
                  id="project_duration_days"
                  type="number"
                  placeholder="e.g., 180"
                  {...register('project_duration_days')}
                  disabled={isLoading}
                  className="h-9"
                />
                {errors.project_duration_days && (
                  <p className="text-xs text-destructive">{errors.project_duration_days.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="process_complexity" className="text-sm">
                  Process Complexity: {complexity}/10
                </Label>
                <Slider
                  id="process_complexity"
                  min={1}
                  max={10}
                  step={1}
                  value={[complexity]}
                  onValueChange={([value]) => {
                    setComplexity(value);
                    setValue('process_complexity', value);
                  }}
                  disabled={isLoading}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="pep_involvement" className="text-sm">PEP Involvement</Label>
                  <p className="text-xs text-muted-foreground">
                    Politically Exposed Person involved
                  </p>
                </div>
                <Switch
                  id="pep_involvement"
                  {...register('pep_involvement')}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full h-10" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Audit Now'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4" ref={resultsRef}>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Analyzing Tender</CardTitle>
                <CardDescription className="text-sm">
                  Our AI is examining the tender details and computing risk factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuditProgress isLoading={isLoading} />
              </CardContent>
            </Card>
          )}

          {results && !isLoading && (
            <>
              <RiskResults results={results} />
              <Button onClick={handleDownloadReport} variant="outline" className="w-full h-10">
                <FileText className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </>
          )}

          {!results && !isLoading && !error && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Enter tender details and click "Audit Now" to see results
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
