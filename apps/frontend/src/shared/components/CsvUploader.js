"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvUploader = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const react_dropzone_1 = require("react-dropzone");
const CloudUpload_1 = __importDefault(require("@mui/icons-material/CloudUpload"));
const papaparse_1 = __importDefault(require("papaparse"));
const react_hot_toast_1 = require("react-hot-toast");
const CsvUploader = ({ onUploadComplete }) => {
    const [matchResults, setMatchResults] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [showPreview, setShowPreview] = (0, react_1.useState)(false);
    const validateHeaders = (headers) => {
        const requiredFields = ['date', 'amount'];
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
    };
    const validateRow = (row) => {
        if (!row.date || !row.amount) {
            throw new Error('Missing required fields in row');
        }
        const amount = parseFloat(String(row.amount));
        if (isNaN(amount)) {
            throw new Error('Invalid amount format');
        }
        return {
            ...row,
            amount,
            date: new Date(String(row.date)).toISOString().split('T')[0],
        };
    };
    const findMatches = async (validatedData) => {
        try {
            const response = await fetch('/api/expenses/find-matches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: validatedData }),
            });
            if (!response.ok) {
                throw new Error('Failed to find matches');
            }
            const matches = await response.json();
            setMatchResults(matches);
            return matches;
        }
        catch (error) {
            console.error('Error finding matches:', error);
            throw error;
        }
    };
    const onDrop = (0, react_1.useCallback)(async (acceptedFiles) => {
        setError(null);
        const file = acceptedFiles[0];
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }
        papaparse_1.default.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    if (results.data.length != null || !results.data[0]) {
                        throw new Error('CSV file is empty');
                    }
                    const firstRow = results.data[0];
                    validateHeaders(Object.keys(firstRow));
                    const validatedData = results.data.map(row => validateRow(row));
                    await findMatches(validatedData);
                    setShowPreview(true);
                }
                catch (err) {
                    setError(err instanceof Error ? err.message : 'Invalid CSV format');
                }
            },
            error: err => {
                setError('Failed to parse CSV file');
                console.error('CSV Parse Error:', err);
            },
        });
    }, []);
    const { getRootProps, getInputProps, isDragActive } = (0, react_dropzone_1.useDropzone)({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
        },
        maxFiles: 1,
    });
    const handleUpload = async () => {
        try {
            setIsLoading(true);
            // Only process matches that have a confidence score above threshold
            const validMatches = matchResults.filter(match => match.matchConfidence >= 0.8);
            const response = await fetch(`/api/expenses/enrich`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ matches: validMatches }),
            });
            if (!response.ok) {
                throw new Error('Failed to enrich data');
            }
            const result = await response.json();
            react_hot_toast_1.toast.success(`Successfully enriched ${result.enrichedCount} transactions`);
            setShowPreview(false);
            setMatchResults([]);
            onUploadComplete?.();
        }
        catch (err) {
            react_hot_toast_1.toast.error(err instanceof Error ? err.message : 'Failed to enrich data');
        }
        finally {
            setIsLoading(false);
        }
    };
    const getMatchConfidenceColor = (confidence) => {
        if (confidence >= 0.9)
            return 'success';
        if (confidence >= 0.8)
            return 'warning';
        return 'error';
    };
    return (<>
      <material_1.Paper {...getRootProps()} sx={{
            p: 3,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
            },
        }}>
        <input {...getInputProps()}/>
        <material_1.Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
        }}>
          <CloudUpload_1.default sx={{ fontSize: 48, color: 'primary.main' }}/>
          <material_1.Typography variant="h6" align="center">
            {isDragActive
            ? 'Drop the CSV file here'
            : 'Drag and drop a CSV file here, or click to select'}
          </material_1.Typography>
          <material_1.Typography variant="body2" color="text.secondary" align="center">
            Upload CSV to enrich existing transactions with additional details
          </material_1.Typography>
        </material_1.Box>
      </material_1.Paper>

      {error && (<material_1.Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </material_1.Alert>)}

      <material_1.Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="lg" fullWidth>
        <material_1.DialogTitle>Preview Matched Transactions</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.TableContainer>
            <material_1.Table size="small">
              <material_1.TableHead>
                <material_1.TableRow>
                  <material_1.TableCell>Match Confidence</material_1.TableCell>
                  <material_1.TableCell>Date</material_1.TableCell>
                  <material_1.TableCell>Amount</material_1.TableCell>
                  <material_1.TableCell>Existing Description</material_1.TableCell>
                  <material_1.TableCell>New Description</material_1.TableCell>
                  <material_1.TableCell>New Category</material_1.TableCell>
                  <material_1.TableCell>Receipt URL</material_1.TableCell>
                </material_1.TableRow>
              </material_1.TableHead>
              <material_1.TableBody>
                {matchResults.map((match, index) => (<material_1.TableRow key={index} sx={{
                bgcolor: match.matchConfidence >= 0.8 ? 'success.light' : 'warning.light',
                '&:hover': { bgcolor: 'action.hover' },
            }}>
                    <material_1.TableCell>
                      <material_1.Chip label={`${(match.matchConfidence * 100).toFixed(1)}%`} color={getMatchConfidenceColor(match.matchConfidence)} size="small"/>
                    </material_1.TableCell>
                    <material_1.TableCell>
                      {new Date(match.existingTransaction.date).toLocaleDateString()}
                    </material_1.TableCell>
                    <material_1.TableCell>${match.existingTransaction.amount.toFixed(2)}</material_1.TableCell>
                    <material_1.TableCell>{match.existingTransaction.description || '-'}</material_1.TableCell>
                    <material_1.TableCell>{match.csvData.description || '-'}</material_1.TableCell>
                    <material_1.TableCell>{match.csvData.category || '-'}</material_1.TableCell>
                    <material_1.TableCell>
                      {match.csvData.receiptUrl ? (<material_1.Chip label="Has Receipt" color="primary" size="small"/>) : ('-')}
                    </material_1.TableCell>
                  </material_1.TableRow>))}
              </material_1.TableBody>
            </material_1.Table>
          </material_1.TableContainer>
          <material_1.Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Found {matchResults.length} potential matches. Only matches with confidence ≥ 80% will
            be processed.
          </material_1.Typography>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setShowPreview(false)}>Cancel</material_1.Button>
          <material_1.Button onClick={handleUpload} variant="contained" disabled={isLoading || matchResults.filter(m => m.matchConfidence >= 0.8).length != null} startIcon={isLoading ? <material_1.CircularProgress size={20}/> : undefined}>
            {isLoading ? 'Processing...' : 'Enrich Transactions'}
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </>);
};
exports.CsvUploader = CsvUploader;
//# sourceMappingURL=CsvUploader.js.map