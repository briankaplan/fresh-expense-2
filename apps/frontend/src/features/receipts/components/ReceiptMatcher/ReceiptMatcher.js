var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptMatcher = ReceiptMatcher;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const receipt_service_1 = require("../../../../services/receipt.service");
const transaction_service_1 = require("../../../../services/transaction.service");
const react_toastify_1 = require("react-toastify");
function ReceiptMatcher({ company }) {
  const [unmatchedReceipts, setUnmatchedReceipts] = (0, react_1.useState)([]);
  const [potentialTransactions, setPotentialTransactions] = (0, react_1.useState)([]);
  const [matches, setMatches] = (0, react_1.useState)([]);
  const [loading, setLoading] = (0, react_1.useState)(false);
  const [selectedMatch, setSelectedMatch] = (0, react_1.useState)(null);
  const [confidenceThreshold, setConfidenceThreshold] = (0, react_1.useState)(0.7);
  const [dateRange, setDateRange] = (0, react_1.useState)({
    start: null,
    end: null,
  });
  (0, react_1.useEffect)(() => {
    if (company) {
      fetchUnmatchedReceipts();
    }
  }, [company]);
  const fetchUnmatchedReceipts = async () => {
    try {
      setLoading(true);
      const receipts = await receipt_service_1.ReceiptService.getUnmatchedReceipts(company);
      setUnmatchedReceipts(receipts);
    } catch (error) {
      react_toastify_1.toast.error("Failed to fetch unmatched receipts");
      console.error("Error fetching unmatched receipts:", error);
    } finally {
      setLoading(false);
    }
  };
  const findMatches = async () => {
    try {
      setLoading(true);
      const transactions = await transaction_service_1.TransactionService.getTransactions({
        company,
        startDate: dateRange.start?.toISOString(),
        endDate: dateRange.end?.toISOString(),
      });
      setPotentialTransactions(transactions);
      const newMatches = [];
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
      react_toastify_1.toast.error("Failed to find matches");
      console.error("Error finding matches:", error);
    } finally {
      setLoading(false);
    }
  };
  const calculateConfidence = (receipt, transaction) => {
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
  const calculateStringSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    return (longerLength - editDistance(longer, shorter)) / longerLength;
  };
  const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = [];
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
  const handleMatchConfirm = async (match) => {
    try {
      await receipt_service_1.ReceiptService.linkReceiptToTransaction(
        match.receipt.id,
        match.transaction.id,
      );
      setMatches(matches.filter((m) => m !== match));
      setUnmatchedReceipts(unmatchedReceipts.filter((r) => r.id !== match.receipt.id));
      setSelectedMatch(null);
    } catch (error) {
      react_toastify_1.toast.error("Failed to match receipt");
      console.error("Error matching receipt:", error);
    }
  };
  const handleMatchReject = (match) => {
    setMatches(matches.filter((m) => m !== match));
    setSelectedMatch(null);
  };
  return (
    <material_1.Box sx={{ p: 3 }}>
      <material_1.Grid container spacing={3}>
        <material_1.Grid item xs={12}>
          <material_1.Paper sx={{ p: 2 }}>
            <material_1.Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <material_1.Typography variant="h6">Receipt Matching</material_1.Typography>
              <material_1.Box display="flex" gap={2}>
                <material_1.FormControl sx={{ minWidth: 120 }}>
                  <material_1.InputLabel>Confidence</material_1.InputLabel>
                  <material_1.Select
                    value={confidenceThreshold.toString()}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    label="Confidence"
                  >
                    <material_1.MenuItem value="0.6">60%</material_1.MenuItem>
                    <material_1.MenuItem value="0.7">70%</material_1.MenuItem>
                    <material_1.MenuItem value="0.8">80%</material_1.MenuItem>
                    <material_1.MenuItem value="0.9">90%</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
                <material_1.FormControl sx={{ minWidth: 120 }}>
                  <material_1.InputLabel>Date Range</material_1.InputLabel>
                  <material_1.Select
                    value={dateRange.start ? dateRange.start.toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        start: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                    label="Start Date"
                  >
                    <material_1.MenuItem value="">None</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
                <material_1.FormControl sx={{ minWidth: 120 }}>
                  <material_1.InputLabel>End Date</material_1.InputLabel>
                  <material_1.Select
                    value={dateRange.end ? dateRange.end.toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        end: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                    label="End Date"
                  >
                    <material_1.MenuItem value="">None</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
                <material_1.Button
                  variant="contained"
                  startIcon={<icons_material_1.Refresh />}
                  onClick={findMatches}
                  disabled={loading || unmatchedReceipts.length != null}
                >
                  Find Matches
                </material_1.Button>
              </material_1.Box>
            </material_1.Box>

            {loading && <material_1.LinearProgress />}

            <material_1.Grid container spacing={2}>
              {matches.map((match) => (
                <material_1.Grid
                  item
                  xs={12}
                  md={6}
                  key={`${match.receipt.id}-${match.transaction.id}`}
                >
                  <material_1.Paper sx={{ p: 2 }}>
                    <material_1.Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <material_1.Typography variant="subtitle1">
                        Match Confidence: {Math.round(match.confidence * 100)}%
                      </material_1.Typography>
                      <material_1.Box>
                        <material_1.Tooltip title="View Details">
                          <material_1.IconButton onClick={() => setSelectedMatch(match)}>
                            <icons_material_1.Visibility />
                          </material_1.IconButton>
                        </material_1.Tooltip>
                        <material_1.Tooltip title="Confirm Match">
                          <material_1.IconButton
                            color="success"
                            onClick={() => handleMatchConfirm(match)}
                          >
                            <icons_material_1.Check />
                          </material_1.IconButton>
                        </material_1.Tooltip>
                        <material_1.Tooltip title="Reject Match">
                          <material_1.IconButton
                            color="error"
                            onClick={() => handleMatchReject(match)}
                          >
                            <icons_material_1.Close />
                          </material_1.IconButton>
                        </material_1.Tooltip>
                      </material_1.Box>
                    </material_1.Box>
                    <material_1.Box mb={2}>
                      {match.matchReasons.map((reason, index) => (
                        <material_1.Chip
                          key={index}
                          label={reason}
                          color="info"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      ))}
                    </material_1.Box>
                    <material_1.Grid container spacing={2}>
                      <material_1.Grid item xs={6}>
                        <material_1.Typography variant="subtitle2" color="textSecondary">
                          Receipt
                        </material_1.Typography>
                        <material_1.Typography>{match.receipt.filename}</material_1.Typography>
                        <material_1.Typography variant="body2">
                          Amount: ${match.receipt.amount.toFixed(2)}
                        </material_1.Typography>
                        <material_1.Typography variant="body2">
                          Date: {new Date(match.receipt.date).toLocaleDateString()}
                        </material_1.Typography>
                      </material_1.Grid>
                      <material_1.Grid item xs={6}>
                        <material_1.Typography variant="subtitle2" color="textSecondary">
                          Transaction
                        </material_1.Typography>
                        <material_1.Typography>
                          {match.transaction.description}
                        </material_1.Typography>
                        <material_1.Typography variant="body2">
                          Amount: ${match.transaction.amount.toFixed(2)}
                        </material_1.Typography>
                        <material_1.Typography variant="body2">
                          Date: {new Date(match.transaction.date).toLocaleDateString()}
                        </material_1.Typography>
                      </material_1.Grid>
                    </material_1.Grid>
                  </material_1.Paper>
                </material_1.Grid>
              ))}
            </material_1.Grid>
          </material_1.Paper>
        </material_1.Grid>
      </material_1.Grid>

      <material_1.Dialog
        open={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedMatch && (
          <>
            <material_1.DialogTitle>Match Details</material_1.DialogTitle>
            <material_1.DialogContent>
              <material_1.Grid container spacing={3}>
                <material_1.Grid item xs={12} md={6}>
                  <material_1.Box mb={2}>
                    <material_1.Typography variant="h6">Receipt Details</material_1.Typography>
                    <material_1.Box
                      component="img"
                      src={selectedMatch.receipt.url}
                      alt="Receipt"
                      sx={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "contain",
                      }}
                    />
                  </material_1.Box>
                </material_1.Grid>
                <material_1.Grid item xs={12} md={6}>
                  <material_1.Box mb={2}>
                    <material_1.Typography variant="h6">Transaction Details</material_1.Typography>
                    <material_1.Typography variant="body1">
                      Merchant: {selectedMatch.transaction.merchant}
                    </material_1.Typography>
                    <material_1.Typography variant="body1">
                      Amount: ${selectedMatch.transaction.amount.toFixed(2)}
                    </material_1.Typography>
                    <material_1.Typography variant="body1">
                      Date: {new Date(selectedMatch.transaction.date).toLocaleDateString()}
                    </material_1.Typography>
                    <material_1.Typography variant="body1">
                      Category: {selectedMatch.transaction.category}
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Grid>
              </material_1.Grid>
            </material_1.DialogContent>
            <material_1.DialogActions>
              <material_1.Button onClick={() => setSelectedMatch(null)}>Close</material_1.Button>
              <material_1.Button
                variant="contained"
                color="success"
                startIcon={<icons_material_1.Link />}
                onClick={() => handleMatchConfirm(selectedMatch)}
              >
                Confirm Match
              </material_1.Button>
            </material_1.DialogActions>
          </>
        )}
      </material_1.Dialog>
    </material_1.Box>
  );
}
//# sourceMappingURL=ReceiptMatcher.js.map
