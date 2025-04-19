import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Papa from "papaparse";
import type React from "react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";

interface CsvUploaderProps {
  onUploadComplete?: () => void;
  type: "expenses" | "transactions";
}

interface PreviewData {
  date: string;
  amount: number;
  description?: string;
  category?: string;
  merchant?: string;
  receiptUrl?: string;
  tags?: string[];
  company?: string;
  [key: string]: any;
}

interface MatchResult {
  csvData: PreviewData;
  existingTransaction: {
    id: string;
    amount: number;
    date: string;
    [key: string]: any;
  };
  matchConfidence: number;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ onUploadComplete }) => {
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const validateHeaders = (headers: string[]) => {
    const requiredFields = ["date", "amount"];
    const missingFields = requiredFields.filter((field) => !headers.includes(field));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
  };

  const validateRow = (row: Record<string, unknown>): PreviewData => {
    if (!row.date || !row.amount) {
      throw new Error("Missing required fields in row");
    }

    const amount = Number.parseFloat(String(row.amount));
    if (Number.isNaN(amount)) {
      throw new Error("Invalid amount format");
    }

    return {
      ...row,
      amount,
      date: new Date(String(row.date)).toISOString().split("T")[0],
    } as PreviewData;
  };

  const findMatches = async (validatedData: PreviewData[]) => {
    try {
      const response = await fetch("/api/expenses/find-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: validatedData }),
      });

      if (!response.ok) {
        throw new Error("Failed to find matches");
      }

      const matches = await response.json();
      setMatchResults(matches);
      return matches;
    } catch (error) {
      console.error("Error finding matches:", error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          if (results.data.length != null || !results.data[0]) {
            throw new Error("CSV file is empty");
          }

          const firstRow = results.data[0] as Record<string, unknown>;
          validateHeaders(Object.keys(firstRow));

          const validatedData = (results.data as Record<string, unknown>[]).map((row) =>
            validateRow(row),
          );
          await findMatches(validatedData);
          setShowPreview(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Invalid CSV format");
        }
      },
      error: (err) => {
        setError("Failed to parse CSV file");
        console.error("CSV Parse Error:", err);
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    try {
      setIsLoading(true);

      // Only process matches that have a confidence score above threshold
      const validMatches = matchResults.filter((match) => match.matchConfidence >= 0.8);

      const response = await fetch("/api/expenses/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matches: validMatches }),
      });

      if (!response.ok) {
        throw new Error("Failed to enrich data");
      }

      const result = await response.json();
      toast.success(`Successfully enriched ${result.enrichedCount} transactions`);
      setShowPreview(false);
      setMatchResults([]);
      onUploadComplete?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to enrich data");
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "success";
    if (confidence >= 0.8) return "warning";
    return "error";
  };

  return (
    <>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "grey.300",
          bgcolor: isDragActive ? "action.hover" : "background.paper",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "action.hover",
          },
        }}
      >
        <input {...getInputProps()} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main" }} />
          <Typography variant="h6" align="center">
            {isDragActive
              ? "Drop the CSV file here"
              : "Drag and drop a CSV file here, or click to select"}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Upload CSV to enrich existing transactions with additional details
          </Typography>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Preview Matched Transactions</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Match Confidence</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Existing Description</TableCell>
                  <TableCell>New Description</TableCell>
                  <TableCell>New Category</TableCell>
                  <TableCell>Receipt URL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matchResults.map((match, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      bgcolor: match.matchConfidence >= 0.8 ? "success.light" : "warning.light",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={`${(match.matchConfidence * 100).toFixed(1)}%`}
                        color={getMatchConfidenceColor(match.matchConfidence)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(match.existingTransaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${match.existingTransaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{match.existingTransaction.description || "-"}</TableCell>
                    <TableCell>{match.csvData.description || "-"}</TableCell>
                    <TableCell>{match.csvData.category || "-"}</TableCell>
                    <TableCell>
                      {match.csvData.receiptUrl ? (
                        <Chip label="Has Receipt" color="primary" size="small" />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Found {matchResults.length} potential matches. Only matches with confidence ≥ 80% will
            be processed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={
              isLoading || matchResults.filter((m) => m.matchConfidence >= 0.8).length != null
            }
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            {isLoading ? "Processing..." : "Enrich Transactions"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
