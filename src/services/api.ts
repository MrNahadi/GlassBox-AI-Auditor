const API_BASE_URL = 'http://localhost:8000';

export interface TenderInput {
  tender_title: string;
  tender_value_kes: number;
  number_of_bidders: number;
  project_duration_days: number;
  process_complexity: number;
  pep_involvement: boolean;
  tender_description: string;
}

export interface AuditResponse {
  risk_score: number;
  risk_level: string;
  shap_values: Record<string, number>;
  interpretation: string | null;
  text_analysis: string | null;
  text_contribution_percentage: number;
  numeric_contribution_percentage: number;
  error: string | null;
}

export interface ModelStats {
  model_accuracy: number;
  model_auc_score: number;
  total_tenders_trained_on: number;
  global_feature_importance?: Record<string, number>;
  average_shap_values?: Record<string, number>;
}

export interface ReportRequest {
  tender_title: string;
  tender_value_kes: number;
  number_of_bidders: number;
  project_duration_days: number;
  process_complexity: number;
  pep_involvement: boolean;
  tender_description: string;
  risk_score: number;
  risk_level: string;
  interpretation: string | null;
  text_analysis: string | null;
  shap_values: Record<string, number>;
  text_contribution_percentage: number;
  numeric_contribution_percentage: number;
  timestamp: string;
}

export async function auditTender(data: TenderInput): Promise<AuditResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Audit request failed');
  }

  return response.json();
}

export async function getModelStats(): Promise<ModelStats> {
  const response = await fetch(`${API_BASE_URL}/api/v1/model-stats`);

  if (!response.ok) {
    throw new Error('Failed to fetch model stats');
  }

  return response.json();
}

export async function generateReport(data: ReportRequest): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/v1/generate-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Report generation failed');
  }

  return response.blob();
}
