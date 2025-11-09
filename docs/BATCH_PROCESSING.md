# Batch Processing Feature

## Overview

The Batch Processing system enables users to audit multiple tenders simultaneously by uploading a CSV file. This feature dramatically increases productivity, allowing hundreds of tenders to be analyzed in minutes instead of processing them individually.

## Key Features

### 1. **CSV File Upload**

- Drag-and-drop or click-to-browse file selection
- Automatic CSV parsing with intelligent header mapping
- Validation of required fields and data types
- Support for common header variations (e.g., "Title" vs "tender_title")
- Detailed error reporting for invalid rows

### 2. **Batch Processing Engine**

- Asynchronous processing with progress tracking
- Configurable delay between API requests (default: 500ms)
- Real-time progress updates during processing
- Graceful error handling per tender
- Abort capability to stop processing mid-batch
- Automatic saving to audit history

### 3. **Live Progress Monitoring**

- Visual progress bar showing completion percentage
- Real-time statistics cards:
  - ✅ Completed audits count
  - ❌ Failed audits count
  - 📊 Average risk score
  - 💰 Total tender value
  - 🔴 High risk count
  - 🟠 Medium risk count
  - 🟢 Low risk count
  - ⏱️ Processing duration

### 4. **Results Visualization**

- **Risk Distribution Pie Chart**: Visual breakdown of risk categories
- **Detailed Results Table**: Sortable table with all audit outcomes
- **Status Indicators**: Real-time icons for pending/processing/completed/failed
- **Color-Coded Risk Badges**: Instant visual risk assessment

### 5. **Data Export**

- Export complete results to CSV
- Includes all input fields plus risk scores and levels
- Timestamped filenames for easy organization
- Error messages included for failed audits

### 6. **Template System**

- Download pre-formatted CSV template
- Sample data included for reference
- Proper header formatting examples

## CSV File Format

### Required Columns

| Column Name             | Type           | Description                         | Example                          |
| ----------------------- | -------------- | ----------------------------------- | -------------------------------- |
| `tender_title`          | Text           | Name/title of the tender            | "Road Construction Project"      |
| `tender_value_kes`      | Number         | Tender value in KES                 | 5000000                          |
| `number_of_bidders`     | Integer        | Number of bidders                   | 8                                |
| `project_duration_days` | Integer        | Project duration in days            | 120                              |
| `process_complexity`    | Integer (1-10) | Complexity rating                   | 5                                |
| `pep_involvement`       | Boolean        | PEP involvement (true/false/yes/no) | false                            |
| `tender_description`    | Text           | Detailed description                | "Competitive bidding process..." |

### Header Variations Supported

The system intelligently maps common header variations:

- **Title**: "title", "tender title", "tender_title"
- **Value**: "value", "tender value", "tender_value_kes", "tender value kes"
- **Bidders**: "bidders", "number of bidders", "number_of_bidders"
- **Duration**: "duration", "project duration", "project_duration_days"
- **Complexity**: "complexity", "process complexity", "process_complexity"
- **PEP**: "pep", "pep involvement", "pep_involvement"
- **Description**: "description", "tender description", "tender_description"

### Example CSV

```csv
tender_title,tender_value_kes,number_of_bidders,project_duration_days,process_complexity,pep_involvement,tender_description
"Road Construction Project",5000000,8,120,4,false,"Standard road construction with competitive bidding"
"Hospital Equipment Purchase",15000000,3,90,7,false,"Medical equipment procurement for new facility"
"IT Systems Upgrade",8000000,5,60,6,false,"Enterprise software and hardware modernization"
"Bridge Rehabilitation",50000000,2,365,9,true,"Major infrastructure project with PEP oversight"
```

## Usage Guide

### Step 1: Prepare Your Data

1. Create a CSV file with the required columns
2. Ensure all required fields are present
3. Use proper data types (numbers for values, true/false for PEP)
4. Or download the template and fill it in

### Step 2: Upload CSV

1. Navigate to "Batch Audit" in the main menu
2. Click "Choose CSV File" or use the template button
3. Select your CSV file from your computer
4. Review the file details displayed

### Step 3: Start Processing

1. Click "Start Batch Audit"
2. Watch real-time progress as tenders are processed
3. Monitor the statistics cards for insights
4. Use "Abort" button if needed to stop processing

### Step 4: Review Results

1. Check the risk distribution pie chart
2. Review the detailed results table
3. Identify high-risk tenders for further investigation
4. Note any failed audits in the error column

### Step 5: Export Results

1. Click "Export Results" button
2. Download CSV with complete audit data
3. Use for reporting, analysis, or record-keeping
4. Results automatically saved to History

## Technical Implementation

### BatchProcessor Class (`batchProcessor.ts`)

#### Methods

**`processBatch(tenders, options)`**

- Processes array of tenders sequentially
- Returns: `{ results, summary }`
- Options:
  - `onProgress`: Callback for real-time updates
  - `delayMs`: Delay between requests (default: 500ms)
  - `saveToHistory`: Auto-save to history (default: true)

**`abort()`**

- Stops processing immediately
- Marks remaining tenders as failed

#### Helper Functions

**`parseCSV(content)`**

- Parses CSV string to BatchTender array
- Handles quoted fields and commas in values
- Maps header variations to standard names
- Validates required fields and data types
- Returns: `BatchTender[]`
- Throws: Detailed error messages for invalid data

**`exportBatchResultsCSV(results)`**

- Converts BatchResult array to CSV string
- Includes all input fields plus outcomes
- Returns: CSV string ready for download

**`generateSampleCSV()`**

- Creates template CSV with sample data
- Includes 5 example tenders
- Returns: CSV string

### Data Types

```typescript
interface BatchTender extends TenderInput {
  row_number: number;
}

interface BatchResult {
  row_number: number;
  input: TenderInput;
  result?: AuditResponse;
  error?: string;
  status: "pending" | "processing" | "completed" | "failed";
}

interface BatchSummary {
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
```

## Performance Considerations

### Processing Speed

- **Delay**: 500ms between requests (configurable)
- **Throughput**: ~120 tenders/minute
- **Batch Size**: No hard limit, but recommended <500 for optimal UX
- **Memory**: ~100KB per tender in browser memory

### API Rate Limiting

- Built-in delay prevents server overload
- Adjust `delayMs` parameter if needed
- Sequential processing ensures data integrity

### Browser Performance

- Real-time updates optimized with React state
- Progress bar renders smoothly
- Table virtualization recommended for 1000+ results (future enhancement)

## Error Handling

### CSV Parsing Errors

- **Missing Headers**: Clear error message identifying missing columns
- **Invalid Data Types**: Row-level errors with specific field issues
- **Empty Rows**: Automatically skipped
- **Malformed CSV**: Handles quoted commas and newlines

### Processing Errors

- **API Failures**: Individual tender marked as failed, batch continues
- **Network Issues**: Error captured, doesn't stop entire batch
- **Timeout**: Configurable timeout per request
- **Validation Errors**: Backend validation errors shown in results table

### Recovery Options

- Failed tenders can be extracted and re-processed
- Partial results always available
- Export includes error messages for debugging

## Best Practices

### File Preparation

1. ✅ Use the template as a starting point
2. ✅ Validate data in Excel/spreadsheet before upload
3. ✅ Remove empty rows
4. ✅ Use consistent formatting (no special characters in numbers)
5. ✅ Keep descriptions concise but informative

### Batch Size

- **Small batches (1-50)**: Process immediately
- **Medium batches (50-200)**: Monitor progress
- **Large batches (200+)**: Consider splitting for better control

### Data Quality

- Ensure numeric fields contain only numbers
- Use "true"/"false" or "yes"/"no" for PEP involvement
- Provide meaningful tender descriptions (10+ characters)
- Verify tender values are in KES

## Use Cases

### 1. Historical Data Migration

- Import past tenders to build audit history
- Analyze historical risk patterns
- Establish baseline metrics

### 2. Periodic Compliance Review

- Monthly/quarterly audit of all tenders
- Identify high-risk patterns
- Generate compliance reports

### 3. Department-Wide Analysis

- Audit tenders from multiple departments
- Compare risk across units
- Support policy decisions with data

### 4. Vendor Analysis

- Group tenders by vendor
- Identify vendor-specific risk patterns
- Support vendor selection processes

### 5. Training and Testing

- Generate sample audit scenarios
- Test system with various risk profiles
- Train staff on risk assessment

## Integration with Other Features

### Audit History

- All successful batch audits automatically saved
- Accessible from History page
- Contributes to trend analysis
- Enables comparison features

### Dashboard

- Batch results affect overall statistics
- Model performance metrics updated
- Historical trends reflect batch data

### Live Audit

- Individual tenders can be re-audited
- "View" from History loads into Live Audit
- Results comparable between batch and live

## Troubleshooting

### CSV Upload Issues

**Problem**: File won't upload

- ✓ Check file extension is `.csv`
- ✓ Ensure file size < 10MB
- ✓ Try saving as CSV UTF-8 format

**Problem**: Parsing errors

- ✓ Verify headers match expected format
- ✓ Check for special characters in data
- ✓ Ensure no merged cells or formulas

### Processing Issues

**Problem**: Batch processing stuck

- ✓ Check backend server is running
- ✓ Verify network connection
- ✓ Use "Abort" and restart

**Problem**: Many failed audits

- ✓ Review error messages in results table
- ✓ Check data validation requirements
- ✓ Ensure backend is responding correctly

### Performance Issues

**Problem**: Slow processing

- ✓ Reduce batch size
- ✓ Increase delay between requests
- ✓ Check backend server resources

## Future Enhancements (Potential)

1. **Excel Support**: Direct .xlsx upload
2. **Drag & Drop**: Drag files onto page
3. **Batch Templates**: Save custom templates
4. **Scheduled Batches**: Automated periodic processing
5. **Advanced Filters**: Pre-filter which tenders to process
6. **Parallel Processing**: Process multiple tenders simultaneously
7. **Resume Capability**: Continue interrupted batches
8. **Cloud Storage**: Save large batches to cloud
9. **Email Notifications**: Alert when batch completes
10. **API Integration**: Direct integration with procurement systems

## Security & Privacy

- CSV data processed client-side before API calls
- No CSV file stored on server
- Results saved in browser localStorage
- Export contains sensitive data - handle with care
- Consider data retention policies for batch results

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Modern mobile browsers
- ❌ IE11 (not supported)

## Limits & Quotas

- **Max File Size**: 10MB (configurable)
- **Max Tenders**: No hard limit (500 recommended)
- **Request Delay**: 500ms minimum (prevents rate limiting)
- **Storage**: Subject to browser localStorage limits (5-10MB)
- **History**: Last 100 audits retained (includes batch audits)

---

**Version**: 1.0  
**Last Updated**: November 2024  
**Component**: Batch Processing System
