import type React from "react";
import { useState } from "react";
import "./ReceiptScanner.css";
import { CloudUpload } from "@mui/icons-material";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useSnackbar } from "notistack";

interface ReceiptScannerProps {
  onScanComplete: (data: any) => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onScanComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) {
      enqueueSnackbar("No image selected", { variant: "warning" });
      return;
    }

    setIsLoading(true);

    try {
      // First, classify if it's a receipt
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([Buffer.from(image.split(",")[1], "base64")]),
        "receipt.jpg",
      );

      const classifyResponse = await fetch("/api/ai/classify-receipt", {
        method: "POST",
        body: formData,
      });

      const { isReceipt, confidence } = await classifyResponse.json();

      if (!isReceipt) {
        enqueueSnackbar("This doesn't appear to be a receipt", {
          variant: "warning",
        });
        return;
      }

      // Extract information from the receipt
      const extractResponse = await fetch("/api/ai/extract-info", {
        method: "POST",
        body: formData,
      });

      const extractedData = await extractResponse.json();

      onScanComplete({
        file: new Blob([Buffer.from(image.split(",")[1], "base64")]),
        extractedData,
        confidence,
      });

      enqueueSnackbar("Receipt scanned successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Error scanning receipt", { variant: "error" });
      console.error("Error scanning receipt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="receipt-scanner-container">
      <h1 className="receipt-scanner-title">Receipt Scanner</h1>

      <div className="receipt-scanner-upload">
        <label htmlFor="receipt-upload" className="receipt-scanner-upload-label">
          Upload Receipt Image
          <input
            id="receipt-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            aria-label="Upload receipt image"
            className="receipt-scanner-upload-input"
          />
        </label>
      </div>

      {image && <img src={image} alt="Receipt preview" className="receipt-scanner-preview" />}

      <button
        className="receipt-scanner-button"
        onClick={handleScan}
        disabled={!image || isLoading}
      >
        {isLoading ? "Scanning..." : "Scan Receipt"}
      </button>

      {result && <div className="receipt-scanner-result">{result}</div>}
    </div>
  );
};

export default ReceiptScanner;
