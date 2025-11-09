import { auditTender, type TenderInput, type AuditResponse } from './api';
import { auditHistory } from './auditHistory';

export interface BatchTender extends TenderInput {
  row_number: number;
}

export interface BatchResult {
  row_number: number;
  input: TenderInput;
  result?: AuditResponse;
  error?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface BatchSummary {
  total: number;
  completed: number;
  failed: number;
  avgRisk: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalValue: number;
  processingTime: number;
}

export class BatchProcessor {
  private results: BatchResult[] = [];
  private onProgress?: (results: BatchResult[], summary: BatchSummary) => void;
  private startTime: number = 0;
  private aborted: boolean = false;
  private progressInterval?: NodeJS.Timeout;

  async processBatch(
    tenders: BatchTender[],
    options: {
      onProgress?: (results: BatchResult[], summary: BatchSummary) => void;
      delayMs?: number;
      saveToHistory?: boolean;
      concurrency?: number; // NEW: Number of parallel requests
    } = {}
  ): Promise<{ results: BatchResult[]; summary: BatchSummary }> {
    this.results = tenders.map(tender => ({
      row_number: tender.row_number,
      input: tender,
      status: 'pending' as const,
    }));
    
    this.onProgress = options.onProgress;
    this.startTime = Date.now();
    this.aborted = false;

    const saveToHistory = options.saveToHistory ?? true;
    const concurrency = options.concurrency ?? 5; // Default: 5 parallel requests

    // Set up progress interval for smoother updates
    this.progressInterval = setInterval(() => {
      if (!this.aborted) {
        this.notifyProgress();
      }
    }, 200);

    try {
      if (concurrency === 1) {
        // Sequential processing (original behavior)
        await this.processSequential(tenders, saveToHistory, options.delayMs ?? 500);
      } else {
        // Parallel processing (NEW)
        await this.processParallel(tenders, saveToHistory, concurrency);
      }
    } finally {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }
    }

    const summary = this.calculateSummary();
    return { results: this.results, summary };
  }

  private async processSequential(
    tenders: BatchTender[],
    saveToHistory: boolean,
    delayMs: number
  ): Promise<void> {
    for (let i = 0; i < tenders.length; i++) {
      if (this.aborted) {
        for (let j = i; j < this.results.length; j++) {
          this.results[j].status = 'failed';
          this.results[j].error = 'Batch processing aborted';
        }
        break;
      }

      await this.processSingleTender(i, tenders[i], saveToHistory);

      if (i < tenders.length - 1 && !this.aborted) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  private async processParallel(
    tenders: BatchTender[],
    saveToHistory: boolean,
    concurrency: number
  ): Promise<void> {
    const queue = [...tenders];
    const activePromises: Promise<void>[] = [];

    while (queue.length > 0 || activePromises.length > 0) {
      if (this.aborted) {
        // Mark all remaining as failed
        queue.forEach((_, idx) => {
          const resultIdx = tenders.length - queue.length + idx;
          this.results[resultIdx].status = 'failed';
          this.results[resultIdx].error = 'Batch processing aborted';
        });
        break;
      }

      // Fill up to concurrency limit
      while (activePromises.length < concurrency && queue.length > 0) {
        const tender = queue.shift()!;
        const index = tenders.indexOf(tender);

        const promise = this.processSingleTender(index, tender, saveToHistory)
          .then(() => {
            // Remove from active promises
            const idx = activePromises.indexOf(promise);
            if (idx > -1) activePromises.splice(idx, 1);
          });

        activePromises.push(promise);
      }

      // Wait for at least one to complete
      if (activePromises.length > 0) {
        await Promise.race(activePromises);
      }
    }

    // Wait for all remaining promises
    await Promise.all(activePromises);
  }

  private async processSingleTender(
    index: number,
    tender: BatchTender,
    saveToHistory: boolean
  ): Promise<void> {
    this.results[index].status = 'processing';

    try {
      const result = await auditTender(tender);
      this.results[index].result = result;
      this.results[index].status = 'completed';

      if (saveToHistory) {
        try {
          auditHistory.save(tender, result);
        } catch (err) {
          console.error('Failed to save to history:', err);
        }
      }
    } catch (error) {
      this.results[index].status = 'failed';
      this.results[index].error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  abort(): void {
    this.aborted = true;
  }

  private notifyProgress(): void {
    if (this.onProgress) {
      const summary = this.calculateSummary();
      this.onProgress([...this.results], summary);
    }
  }

  private calculateSummary(): BatchSummary {
    const completed = this.results.filter(r => r.status === 'completed');
    const failed = this.results.filter(r => r.status === 'failed');
    
    const riskScores = completed
      .filter(r => r.result)
      .map(r => r.result!.risk_score);
    
    const avgRisk = riskScores.length > 0
      ? riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length
      : 0;

    const getRiskCategory = (level: string) => {
      const lower = level.toLowerCase();
      if (lower === 'minimal' || lower === 'low') return 'low';
      if (lower === 'medium') return 'medium';
      return 'high';
    };

    const highRiskCount = completed.filter(
      r => r.result && getRiskCategory(r.result.risk_level) === 'high'
    ).length;

    const mediumRiskCount = completed.filter(
      r => r.result && getRiskCategory(r.result.risk_level) === 'medium'
    ).length;

    const lowRiskCount = completed.filter(
      r => r.result && getRiskCategory(r.result.risk_level) === 'low'
    ).length;

    const totalValue = completed
      .map(r => r.input.tender_value_kes)
      .reduce((sum, value) => sum + value, 0);

    const processingTime = Date.now() - this.startTime;

    return {
      total: this.results.length,
      completed: completed.length,
      failed: failed.length,
      avgRisk,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      totalValue,
      processingTime,
    };
  }
}

export function parseCSV(content: string): BatchTender[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must contain header row and at least one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Map common header variations to expected field names
  const headerMap: Record<string, string> = {
    'title': 'tender_title',
    'tender title': 'tender_title',
    'tender_title': 'tender_title',
    'value': 'tender_value_kes',
    'tender value': 'tender_value_kes',
    'tender_value_kes': 'tender_value_kes',
    'tender value kes': 'tender_value_kes',
    'bidders': 'number_of_bidders',
    'number of bidders': 'number_of_bidders',
    'number_of_bidders': 'number_of_bidders',
    'duration': 'project_duration_days',
    'project duration': 'project_duration_days',
    'project_duration_days': 'project_duration_days',
    'project duration days': 'project_duration_days',
    'complexity': 'process_complexity',
    'process complexity': 'process_complexity',
    'process_complexity': 'process_complexity',
    'pep': 'pep_involvement',
    'pep involvement': 'pep_involvement',
    'pep_involvement': 'pep_involvement',
    'description': 'tender_description',
    'tender description': 'tender_description',
    'tender_description': 'tender_description',
  };

  const normalizedHeaders = headers.map(h => headerMap[h] || h);

  const tenders: BatchTender[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      
      const tender: any = { row_number: i };
      
      for (let j = 0; j < normalizedHeaders.length; j++) {
        const header = normalizedHeaders[j];
        const value = values[j]?.trim() || '';
        
        if (header === 'tender_title') {
          tender.tender_title = value;
        } else if (header === 'tender_value_kes') {
          tender.tender_value_kes = parseFloat(value.replace(/[^0-9.-]/g, ''));
        } else if (header === 'number_of_bidders') {
          tender.number_of_bidders = parseInt(value);
        } else if (header === 'project_duration_days') {
          tender.project_duration_days = parseInt(value);
        } else if (header === 'process_complexity') {
          tender.process_complexity = parseInt(value);
        } else if (header === 'pep_involvement') {
          const lower = value.toLowerCase();
          tender.pep_involvement = lower === 'true' || lower === 'yes' || lower === '1';
        } else if (header === 'tender_description') {
          tender.tender_description = value;
        }
      }

      // Validate required fields
      if (!tender.tender_title) throw new Error('Missing tender_title');
      if (!tender.tender_value_kes || isNaN(tender.tender_value_kes)) throw new Error('Invalid tender_value_kes');
      if (!tender.number_of_bidders || isNaN(tender.number_of_bidders)) throw new Error('Invalid number_of_bidders');
      if (!tender.project_duration_days || isNaN(tender.project_duration_days)) throw new Error('Invalid project_duration_days');
      if (!tender.process_complexity || isNaN(tender.process_complexity)) throw new Error('Invalid process_complexity');
      if (tender.pep_involvement === undefined) tender.pep_involvement = false;
      if (!tender.tender_description) throw new Error('Missing tender_description');

      tenders.push(tender as BatchTender);
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }

  if (errors.length > 0 && tenders.length === 0) {
    throw new Error(`Failed to parse CSV:\n${errors.join('\n')}`);
  }

  return tenders;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values.map(v => v.replace(/^"|"$/g, '').trim());
}

export function exportBatchResultsCSV(results: BatchResult[]): string {
  const headers = [
    'Row',
    'Tender Title',
    'Value (KES)',
    'Bidders',
    'Duration (Days)',
    'Complexity',
    'PEP',
    'Risk Score',
    'Risk Level',
    'Status',
    'Error'
  ];

  const rows = results.map(r => [
    r.row_number,
    `"${r.input.tender_title}"`,
    r.input.tender_value_kes,
    r.input.number_of_bidders,
    r.input.project_duration_days,
    r.input.process_complexity,
    r.input.pep_involvement ? 'Yes' : 'No',
    r.result ? (r.result.risk_score * 100).toFixed(2) + '%' : '',
    r.result ? r.result.risk_level : '',
    r.status,
    r.error ? `"${r.error}"` : ''
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function generateSampleCSV(): string {
  const headers = 'tender_title,tender_value_kes,number_of_bidders,project_duration_days,process_complexity,pep_involvement,tender_description';
  
  const samples = [
    '"Road Construction Project",5000000,8,120,4,false,"Standard road construction with competitive bidding"',
    '"Hospital Equipment Purchase",15000000,3,90,7,false,"Medical equipment procurement for new facility"',
    '"IT Systems Upgrade",8000000,5,60,6,false,"Enterprise software and hardware modernization"',
    '"Bridge Rehabilitation",50000000,2,365,9,true,"Major infrastructure project with PEP oversight"',
    '"School Building Construction",12000000,6,180,5,false,"Construction of primary school in rural area"',
  ];

  return [headers, ...samples].join('\n');
}
