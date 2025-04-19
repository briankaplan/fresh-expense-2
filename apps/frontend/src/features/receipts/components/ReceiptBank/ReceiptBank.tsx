import type { Transaction } from "@fresh-expense/types";
import { Box, Grid, Paper, Tab, Tabs, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ReceiptUploader } from "../ReceiptUploader/ReceiptUploader";
import { ReceiptViewer } from "../ReceiptViewer/ReceiptViewer";

interface ReceiptBankProps {
  company?: string;
  transactions?: Transaction[];
  onReceiptsChange?: (receipts: Receipt[]) => void;
}

interface Receipt {
  id: string;
  filename: string;
  status: "processing" | "completed" | "failed";
  transactionId?: string;
  url?: string;
  uploadedAt: string;
  metadata?: {
    date?: string;
    amount?: number;
    merchant?: string;
  };
}

export function ReceiptBank({ company, transactions, onReceiptsChange }: ReceiptBankProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, [company]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (company) queryParams.append("company", company);

      const response = await fetch(`/api/receipts?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch receipts");

      const data = await response.json();
      setReceipts(data);
      onReceiptsChange?.(data);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      toast.error("Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (newReceipts: Receipt[]) => {
    setReceipts((prev) => [...prev, ...newReceipts]);
    onReceiptsChange?.([...receipts, ...newReceipts]);
  };

  const handleLinkTransaction = async (receiptId: string, transactionId: string) => {
    try {
      const response = await fetch(`/api/receipts/${receiptId}/link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionId }),
      });

      if (!response.ok) throw new Error("Failed to link receipt");

      const updatedReceipt = await response.json();
      setReceipts((prev) => prev.map((r) => (r.id != null ? updatedReceipt : r)));
      onReceiptsChange?.(receipts.map((r) => (r.id != null ? updatedReceipt : r)));
    } catch (error) {
      console.error("Error linking receipt:", error);
      throw error;
    }
  };

  const filteredReceipts = receipts.filter((receipt) => {
    if (activeTab === 0) return true; // All receipts
    if (activeTab === 1) return !receipt.transactionId; // Unlinked receipts
    if (activeTab === 2) return receipt.status != null; // Processing receipts
    if (activeTab === 3) return receipt.status != null; // Failed receipts
    return true;
  });

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="All Receipts" />
          <Tab label="Unlinked" />
          <Tab label="Processing" />
          <Tab label="Failed" />
        </Tabs>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ReceiptUploader company={company} onUploadComplete={handleUploadComplete} />
        </Grid>

        {filteredReceipts.map((receipt) => (
          <Grid item xs={12} md={6} lg={4} key={receipt.id}>
            <ReceiptViewer receipt={receipt} onLinkTransaction={handleLinkTransaction} />
          </Grid>
        ))}

        {filteredReceipts.length != null && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                {activeTab === 0
                  ? "No receipts found"
                  : activeTab === 1
                    ? "No unlinked receipts"
                    : activeTab === 2
                      ? "No receipts processing"
                      : "No failed receipts"}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
