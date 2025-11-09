# Audit History Feature

## Overview

The Audit History system provides comprehensive tracking and analytics for all tender audits performed through Glassbox AI. This feature enables institutional memory, trend analysis, and data-driven insights across multiple audits.

## Features

### 1. **Automatic History Tracking**

- Every successful audit is automatically saved to browser localStorage
- Maximum of 100 audits stored (oldest removed automatically)
- Each record includes:
  - Unique ID and timestamp
  - Complete tender input data
  - Full audit results with SHAP explanations
  - Risk score and level

### 2. **Analytics Dashboard**

The History page displays:

- **Total Audits**: All-time audit count
- **Average Risk Score**: Mean risk across all audits
- **High Risk Tenders**: Count and percentage of high-risk findings
- **Total Value**: Cumulative KES value of all audited tenders

### 3. **Visualizations**

#### Risk Trend Chart

- Line chart showing average risk score over the last 30 days
- Groups audits by date for trend analysis
- Helps identify patterns in procurement risk

#### Risk Distribution Pie Chart

- Shows breakdown of Low/Medium/High risk audits
- Color-coded for quick insights (green/orange/red)
- Percentage distribution displayed

### 4. **Search and Filter**

- **Search**: Filter by tender title
- **Risk Level Filter**: Show only specific risk categories
- Real-time filtering with instant results

### 5. **Audit Management**

#### View Audit

- Click "View" button to load a past audit
- Navigates to Live Audit page with:
  - Form pre-filled with original input data
  - Results automatically displayed
  - Ready for comparison or re-analysis

#### Delete Audit

- Individual audit deletion with confirmation
- "Clear All" option to reset entire history
- Permanent deletion (cannot be undone)

### 6. **Data Export**

#### CSV Export

- Download audit history as CSV file
- Includes all fields: title, value, bidders, duration, etc.
- Risk scores and levels included
- Filename: `glassbox_audit_history_YYYY-MM-DD.csv`

#### JSON Export

- Complete audit data in JSON format
- Preserves all nested structures (SHAP values, interpretations)
- Useful for data analysis and backup
- Filename: `glassbox_audit_history_YYYY-MM-DD.json`

## Usage Guide

### Accessing History

1. Click "History" in the main navigation bar
2. View statistics cards at the top
3. Scroll down to see trend charts
4. Browse the audit records list

### Searching Audits

1. Use the search box to filter by tender title
2. Select a risk level from the dropdown filter
3. Results update automatically

### Viewing Past Audits

1. Find the audit in the list
2. Click the "View" button
3. System navigates to Live Audit page
4. Form and results are pre-loaded
5. Run a new audit or download the report

### Exporting Data

1. Click "Export CSV" for spreadsheet format
2. Click "Export JSON" for complete data backup
3. Files download automatically with timestamp

### Managing Storage

- History is stored in browser localStorage
- Maximum 100 records (configurable in code)
- When limit reached, oldest audits are removed
- Click "Clear All" to reset history

## Technical Details

### Storage Location

- **Key**: `glassbox_audit_history`
- **Type**: Browser localStorage
- **Size**: ~10KB per audit (varies with SHAP data)
- **Limit**: 100 audits (FIFO removal)

### Data Structure

```typescript
interface AuditRecord {
  id: string; // Auto-generated UUID
  timestamp: string; // ISO 8601 format
  input: TenderInput; // All form fields
  result: AuditResponse; // Complete audit results
}
```

### Service Layer (`src/services/auditHistory.ts`)

- `save(input, result)`: Add new audit
- `getAll()`: Retrieve all audits
- `getById(id)`: Get specific audit
- `delete(id)`: Remove audit
- `clear()`: Delete all history
- `getStats()`: Calculate analytics
- `getRiskTrend(days)`: Daily risk trends
- `exportToJSON()`: JSON export
- `exportToCSV()`: CSV export

## Benefits

1. **Institutional Knowledge**: Build a database of audited tenders
2. **Trend Analysis**: Identify patterns in procurement risk over time
3. **Compliance Tracking**: Monitor high-risk tender frequency
4. **Data-Driven Decisions**: Use historical data to inform policy
5. **Comparison**: Compare similar tenders across time periods
6. **Accountability**: Maintain audit trail for transparency
7. **Training**: Use past audits as examples for team training

## Future Enhancements (Potential)

- Multi-audit comparison view
- Advanced filtering (date ranges, value ranges)
- Cloud sync across devices
- Export to PDF reports
- Custom analytics dashboards
- Integration with external audit systems
- Automated risk alerts based on trends
- Bulk import of historical audits

## Privacy & Security

- All data stored locally in browser
- No server storage or transmission
- Data persists until manually cleared or browser cache cleared
- Export sensitive data with caution
- Consider privacy when sharing exported files

## Browser Compatibility

- Works in all modern browsers supporting localStorage
- Chrome, Firefox, Safari, Edge fully supported
- Mobile browsers supported
- Private/Incognito mode: data cleared when session ends

## Troubleshooting

### History not saving

- Check browser localStorage is enabled
- Ensure no browser extensions blocking storage
- Verify sufficient storage quota available

### Charts not displaying

- Ensure at least 1 audit in history
- Check date range for trend chart (last 30 days)
- Refresh page if data seems stale

### Export not working

- Check popup blocker settings
- Ensure browser allows file downloads
- Try different export format (CSV vs JSON)

---

**Version**: 1.0  
**Last Updated**: 2024  
**Component**: Audit History System
