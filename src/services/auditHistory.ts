import type { AuditResponse, TenderInput } from './api';

export interface AuditRecord {
  id: string;
  timestamp: number;
  input: TenderInput;
  result: AuditResponse;
}

const STORAGE_KEY = 'glassbox_audit_history';
const MAX_HISTORY = 100; // Keep last 100 audits

export const auditHistory = {
  save(input: TenderInput, result: AuditResponse): AuditRecord {
    const record: AuditRecord = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      input,
      result,
    };

    const history = this.getAll();
    history.unshift(record); // Add to beginning
    
    // Keep only MAX_HISTORY records
    const trimmed = history.slice(0, MAX_HISTORY);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return record;
  },

  getAll(): AuditRecord[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getById(id: string): AuditRecord | null {
    const history = this.getAll();
    return history.find(record => record.id === id) || null;
  },

  delete(id: string): void {
    const history = this.getAll();
    const filtered = history.filter(record => record.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  getStats() {
    const history = this.getAll();
    
    if (history.length === 0) {
      return {
        total: 0,
        avgRisk: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
        totalValue: 0,
      };
    }

    const highRiskCount = history.filter(r => r.result.risk_level === 'High' || r.result.risk_level === 'Critical').length;
    const mediumRiskCount = history.filter(r => r.result.risk_level === 'Medium').length;
    const lowRiskCount = history.filter(r => r.result.risk_level === 'Low' || r.result.risk_level === 'Minimal').length;
    const avgRisk = history.reduce((sum, r) => sum + r.result.risk_score, 0) / history.length;
    const totalValue = history.reduce((sum, r) => sum + r.input.tender_value_kes, 0);

    return {
      total: history.length,
      avgRisk,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      totalValue,
    };
  },

  getRiskTrend(days: number = 30): Array<{ date: string; avgRisk: number; count: number }> {
    const history = this.getAll();
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recent = history.filter(r => r.timestamp >= cutoff);

    // Group by day
    const byDay = new Map<string, { total: number; count: number }>();
    
    recent.forEach(record => {
      const date = new Date(record.timestamp).toLocaleDateString();
      const existing = byDay.get(date) || { total: 0, count: 0 };
      byDay.set(date, {
        total: existing.total + record.result.risk_score,
        count: existing.count + 1,
      });
    });

    return Array.from(byDay.entries())
      .map(([date, { total, count }]) => ({
        date,
        avgRisk: total / count,
        count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  exportToJSON(): string {
    const history = this.getAll();
    return JSON.stringify(history, null, 2);
  },

  exportToCSV(): string {
    const history = this.getAll();
    
    const headers = [
      'Timestamp',
      'Tender Title',
      'Value (KES)',
      'Bidders',
      'Duration (Days)',
      'Complexity',
      'PEP Involvement',
      'Risk Score',
      'Risk Level',
    ];

    const rows = history.map(record => [
      new Date(record.timestamp).toLocaleString(),
      record.input.tender_title,
      record.input.tender_value_kes,
      record.input.number_of_bidders,
      record.input.project_duration_days,
      record.input.process_complexity,
      record.input.pep_involvement ? 'Yes' : 'No',
      (record.result.risk_score * 100).toFixed(2) + '%',
      record.result.risk_level,
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  },
};
