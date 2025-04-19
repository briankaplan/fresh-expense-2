import type { Receipt, Transaction } from "@fresh-expense/types";
import {
  Check,
  Close,
  Delete,
  Edit,
  Link as LinkIcon,
  Refresh,
  Unlink,
  Visibility,
  Warning,
} from "@mui/icons-material";
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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ReceiptService } from "../../../../services/receipt.service";
import { TransactionService } from "../../../../services/transaction.service";

interface MatchResult {
  receipt: Receipt;
  transaction: Transaction;
  confidence: number;
  matchReasons: string[];
}

interface ReceiptMatcherProps {
  company?: string;
}

export function ReceiptMatcher({ company }: ReceiptMatcherProps) {
  const [unmatchedReceipts, setUnmatchedReceipts] = useState<Receipt[]>([]);
  const [potentialTransactions, setPotentialTransactions] = useState<Transaction[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  useEffect(() => {
    if (company) {
      fetchUnmatchedReceipts();
    }
  }, [company]);

  const fetchUnmatchedReceipts = async () => {
    try {
      setLoading(true);
      const receipts = await ReceiptService.getUnmatchedReceipts(company);
      setUnmatchedReceipts(receipts);
    } catch (error) {
      toast.error("Failed to fetch unmatched receipts");
      console.error("Error fetching unmatched receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const findMatches = async () => {
    try {
      setLoading(true);
      const transactions = await TransactionService.getTransactions({
        company,
        startDate: dateRange.start?.toISOString(),
        endDate: dateRange.end?.toISOString(),
      });
      setPotentialTransactions(transactions);

      const newMatches: MatchResult[] = [];

      for (const receipt of unmatchedReceipts) {
        for (const transaction of transactions) {
          const confidence = calculateConfidence(receipt, transaction);
          if (confidence >= confidenceThreshold) {
            newMatches.push({
              receipt,
              transaction,
              confidence,
              matchReasons: [],
            });
          }
        }
      }

      setMatches(newMatches);
    } catch (error) {
      toast.error("Failed to find matches");
      console.error("Error finding matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateConfidence = (receipt: Receipt, transaction: Transaction): number => {
    let confidence = 0;
    const dateMatch =
      Math.abs(new Date(receipt.date).getTime() - new Date(transaction.date).getTime()) <
      24 * 60 * 60 * 1000; // Within 24 hours
    if (dateMatch) confidence += 0.4;

    const amountMatch = Math.abs(receipt.amount - transaction.amount) < 0.01;
    if (amountMatch) confidence += 0.4;

    const merchantMatch =
      calculateStringSimilarity(
        receipt.merchant?.toLowerCase() || "",
        transaction.merchant?.toLowerCase() || "",
      ) > 0.8;
    if (merchantMatch) confidence += 0.2;

    return confidence;
  };

  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    return (longerLength - editDistance(longer, shorter)) / longerLength;
  };

  const editDistance = (s1: string, s2: string): number => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };

  const handleMatchConfirm = async (match: MatchResult) => {
    try {
      await ReceiptService.linkReceiptToTransaction(match.receipt.id, match.transaction.id);
      setMatches(matches.filter((m) => m !== match));
      setUnmatchedReceipts(unmatchedReceipts.filter((r) => r.id !== match.receipt.id));
      setSelectedMatch(null);
    } catch (error) {
      toast.error("Failed to match receipt");
      console.error("Error matching receipt:", error);
    }
  };

  const handleMatchReject = (match: MatchResult) => {
    setMatches(matches.filter((m) => m !== match));
    setSelectedMatch(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Receipt Matching</Typography>
              <Box display="flex" gap={2}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Confidence</InputLabel>
                  <Select
                    value={confidenceThreshold.toString()}
                    onChange={(e: SelectChangeEvent) =>
                      setConfidenceThreshold(Number(e.target.value))
                    }
                    label="Confidence"
                  >
                    <MenuItem value="0.6">60%</MenuItem>
                    <MenuItem value="0.7">70%</MenuItem>
                    <MenuItem value="0.8">80%</MenuItem>
                    <MenuItem value="0.9">90%</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRange.start ? dateRange.start.toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        start: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                    label="Start Date"
                  >
                    <MenuItem value="">None</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>End Date</InputLabel>
                  <Select
                    value={dateRange.end ? dateRange.end.toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        end: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                    label="End Date"
                  >
                    <MenuItem value="">None</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={findMatches}
                  disabled={loading || unmatchedReceipts.length != null}
                >
                  Find Matches
                </Button>
              </Box>
            </Box>

            {loading && <LinearProgress />}

            <Grid container spacing={2}>
              {matches.map((match) => (
                <Grid item xs={12} md={6} key={`${match.receipt.id}-${match.transaction.id}`}>
                  <Paper sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1">
                        Match Confidence: {Math.round(match.confidence * 100)}%
                      </Typography>
                      <Box>
                        <Tooltip title="View Details">
                          <IconButton onClick={() => setSelectedMatch(match)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Confirm Match">
                          <IconButton color="success" onClick={() => handleMatchConfirm(match)}>
                            <Check />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject Match">
                          <IconButton color="error" onClick={() => handleMatchReject(match)}>
                            <Close />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Box mb={2}>
                      {match.matchReasons.map((reason, index) => (
                        <Chip key={index} label={reason} color="info" size="small" sx={{ mr: 1 }} />
                      ))}
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Receipt
                        </Typography>
                        <Typography>{match.receipt.filename}</Typography>
                        <Typography variant="body2">
                          Amount: ${match.receipt.amount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Date: {new Date(match.receipt.date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Transaction
                        </Typography>
                        <Typography>{match.transaction.description}</Typography>
                        <Typography variant="body2">
                          Amount: ${match.transaction.amount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Date: {new Date(match.transaction.date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={!!selectedMatch} onClose={() => setSelectedMatch(null)} maxWidth="md" fullWidth>
        {selectedMatch && (
          <>
            <DialogTitle>Match Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Typography variant="h6">Receipt Details</Typography>
                    <Box
                      component="img"
                      src={selectedMatch.receipt.url}
                      alt="Receipt"
                      sx={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Typography variant="h6">Transaction Details</Typography>
                    <Typography variant="body1">
                      Merchant: {selectedMatch.transaction.merchant}
                    </Typography>
                    <Typography variant="body1">
                      Amount: ${selectedMatch.transaction.amount.toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      Date: {new Date(selectedMatch.transaction.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1">
                      Category: {selectedMatch.transaction.category}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedMatch(null)}>Close</Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<LinkIcon />}
                onClick={() => handleMatchConfirm(selectedMatch)}
              >
                Confirm Match
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
