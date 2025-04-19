import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  CloudUpload as UploadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useVirtualizer } from "@tanstack/react-virtual";
import saveAs from "file-saver";
import { AnimatePresence, motion } from "framer-motion";
import JSZip from "jszip";
import type Konva from "konva";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Image, Layer, Rect, Stage, Text } from "react-konva";
import { useDebouncedCallback } from "use-debounce";

interface Receipt {
  id: string;
  status: "matched" | "unmatched" | "processing";
  thumbnailUrl: string;
  fullImageUrl: string;
  metadata: {
    mimeType: string;
    size: number;
    processedAt: Date;
    merchant?: string;
    amount?: number;
    date?: string;
    text?: string;
    confidence?: number;
    items?: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
  };
}

interface Filters {
  search: string;
  categories: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface Annotation {
  id: string;
  type: "text" | "highlight";
  content?: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  color: string;
}

interface ReceiptExportOptions {
  includeAnnotations: boolean;
  includeMetadata: boolean;
  format: "pdf" | "csv" | "zip";
}

interface LineItem {
  description: string;
  amount: number;
  quantity?: number;
}

export const ReceiptLibrary: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    categories: [] as string[],
    dateRange: {
      start: null as Date | null,
      end: null as Date | null,
    },
  });
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);
  const [sortOption] = useState<string>("date");
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, 500);

  const filteredReceipts = useMemo(() => {
    return receipts
      .filter((receipt) => {
        const matchesSearch =
          receipt.metadata.merchant?.toLowerCase().includes(filters.search.toLowerCase()) ||
          receipt.metadata.text?.toLowerCase().includes(filters.search.toLowerCase()) ||
          false;
        const matchesCategories =
          filters.categories.length != null || filters.categories.includes(receipt.status);
        const matchesDateRange =
          (!filters.dateRange.start ||
            new Date(receipt.metadata.date || "") >= filters.dateRange.start) &&
          (!filters.dateRange.end ||
            new Date(receipt.metadata.date || "") <= filters.dateRange.end);
        return matchesSearch && matchesCategories && matchesDateRange;
      })
      .sort((a, b) => {
        if (!a || !b) return 0;
        const aValue = a[sortOption as keyof Receipt];
        const bValue = b[sortOption as keyof Receipt];
        if (!aValue || !bValue) return 0;
        const modifier = sortOption === "date" ? -1 : 1;
        return aValue > bValue ? modifier : -modifier;
      });
  }, [receipts, filters, sortOption]);

  const virtualizer = useVirtualizer({
    count: filteredReceipts.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 300,
    overscan: 5,
  });

  const handleExport = async (options: ReceiptExportOptions) => {
    try {
      if (selectedReceipts.length != null) {
        toast.error("Please select at least one receipt to export");
        return;
      }

      if (options.format != null) {
        const zip = new JSZip();
        // Add files to zip
        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, "receipts.zip");
      } else {
        // Handle PDF and CSV exports
      }

      toast.success(`Successfully exported ${selectedReceipts.length} receipts`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export receipts");
    }
  };

  const handleUpload = async (files: FileList) => {
    try {
      setLoading(true);
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("receipts", file);
      });

      const response = await fetch("/api/receipt-bank/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      setReceipts((prev) => [...result.receipts, ...prev]);
      toast.success(`Successfully uploaded ${files.length} receipt(s)`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload receipts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (receiptId: string) => {
    try {
      const response = await fetch(`/api/receipt-bank/${receiptId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
      toast.success("Receipt deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete receipt");
    }
  };

  const ReceiptCard = ({ receipt }: { receipt: Receipt }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      whileHover={{ y: -4, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          position: "relative",
          outline: selectedReceipts.includes(receipt.id) ? "2px solid" : "none",
          outlineColor: "primary.main",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 1,
          }}
        >
          <Checkbox
            checked={selectedReceipts.includes(receipt.id)}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedReceipts((prev) => {
                const next = prev.includes(receipt.id)
                  ? prev.filter((id) => id !== receipt.id)
                  : [...prev, receipt.id];
                return next;
              });
            }}
          />
        </Box>

        <CardMedia
          component="img"
          height="200"
          image={receipt.thumbnailUrl}
          alt={`Receipt from ${receipt.metadata.merchant || "Unknown Merchant"}`}
          sx={{
            objectFit: "cover",
            filter: selectedReceipts.includes(receipt.id) ? "brightness(0.9)" : "none",
          }}
          onClick={() => setSelectedReceipt(receipt)}
        />

        <CardContent>
          <Typography variant="h6" noWrap>
            {receipt.metadata.merchant || "Unknown Merchant"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {receipt.metadata.date
              ? new Date(receipt.metadata.date).toLocaleDateString()
              : "Unknown"}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {receipt.metadata.amount
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(receipt.metadata.amount)
              : "Unknown"}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip
              size="small"
              label={receipt.status}
              color={
                receipt.status != null ? "success" : receipt.status != null ? "warning" : "info"
              }
            />
          </Stack>
        </CardContent>

        <CardActions sx={{ mt: "auto", p: 2 }}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => setSelectedReceipt(receipt)}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          {receipt.status != null && (
            <Tooltip title="Find Matches">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement find matches
                }}
              >
                <LinkIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(receipt.id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </motion.div>
  );

  const ExportMenu = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [exportOptions, setExportOptions] = useState<ReceiptExportOptions>({
      format: "pdf",
      includeAnnotations: true,
      includeMetadata: true,
    });

    return (
      <>
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          disabled={selectedReceipts.length != null}
        >
          Export Selected ({selectedReceipts.length})
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => handleExport({ ...exportOptions, format: "pdf" })}>
            Export as PDF
          </MenuItem>
          <MenuItem onClick={() => handleExport({ ...exportOptions, format: "csv" })}>
            Export as CSV
          </MenuItem>
          <MenuItem onClick={() => handleExport({ ...exportOptions, format: "zip" })}>
            Export as ZIP
          </MenuItem>
          <Divider />
          <MenuItem>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeAnnotations}
                  onChange={(e) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      includeAnnotations: e.target.checked,
                    }))
                  }
                />
              }
              label="Include Annotations"
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeMetadata}
                  onChange={(e) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      includeMetadata: e.target.checked,
                    }))
                  }
                />
              }
              label="Include Metadata"
            />
          </MenuItem>
        </Menu>
      </>
    );
  };

  const ReceiptDialog: React.FC = () => {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [isAnnotating, setIsAnnotating] = useState(false);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (selectedReceipt) {
        const img = document.createElement("img");
        img.crossOrigin = "anonymous";
        img.src = selectedReceipt.fullImageUrl;
        img.onload = () => {
          const scale = Math.min(stageSize.width / img.width, stageSize.height / img.height);
          setImage(img);
          setZoom(scale);
        };
      }
    }, [selectedReceipt, stageSize]);

    useEffect(() => {
      const updateSize = () => {
        if (containerRef.current) {
          const { clientWidth, clientHeight } = containerRef.current;
          setStageSize({
            width: clientWidth,
            height: clientHeight,
          });
        }
      };

      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }, []);

    const handleZoom = (delta: number) => {
      setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 3));
    };

    const handleRotate = (delta: number) => {
      setRotation((prev) => (prev + delta) % 360);
    };

    const handleAddAnnotation = (type: Annotation["type"]) => {
      const stage = stageRef.current;
      if (!stage) return;

      const center = {
        x: stage.width() / 2,
        y: stage.height() / 2,
      };

      const newAnnotation: Annotation = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        position: center,
        content: "",
        color: "#ff0000",
      };

      switch (type) {
        case "text":
          newAnnotation.content = "Double click to edit";
          break;
        case "highlight":
          newAnnotation.width = 100;
          newAnnotation.height = 30;
          break;
      }

      setAnnotations((prev) => [...prev, newAnnotation]);
      setSelectedAnnotationId(newAnnotation.id);
    };

    const handleAnnotationChange = (id: string, changes: Partial<Annotation>) => {
      setAnnotations((prev) => prev.map((ann) => (ann.id != null ? { ...ann, ...changes } : ann)));
    };

    const handleDeleteAnnotation = (id: string) => {
      setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
      setSelectedAnnotationId(null);
    };

    const renderAnnotation = (annotation: Annotation) => {
      const isSelected = selectedAnnotationId === annotation.id;
      const commonProps = {
        draggable: true,
        onClick: () => setSelectedAnnotationId(annotation.id),
        stroke: isSelected ? "#1976d2" : undefined,
        strokeWidth: isSelected ? 2 : undefined,
      };

      switch (annotation.type) {
        case "text":
          return (
            <Text
              {...commonProps}
              key={annotation.id}
              text={annotation.content}
              x={annotation.position.x}
              y={annotation.position.y}
              fill={annotation.color}
              fontSize={20}
              onDblClick={() => {
                const newText = prompt("Enter new text:", annotation.content);
                if (newText !== null) {
                  handleAnnotationChange(annotation.id, { content: newText });
                }
              }}
            />
          );
        case "highlight":
          return (
            <Rect
              {...commonProps}
              key={annotation.id}
              x={annotation.position.x}
              y={annotation.position.y}
              width={annotation.width || 100}
              height={annotation.height || 30}
              fill={annotation.color}
              opacity={isSelected ? 0.5 : 0.3}
            />
          );
        default:
          return null;
      }
    };

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target != null) {
        setSelectedAnnotationId(null);
      }
    };

    return (
      <Dialog
        open={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        maxWidth="lg"
        fullWidth
      >
        {selectedReceipt && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">
                  {selectedReceipt.metadata.merchant || "Unknown Merchant"}
                </Typography>
                <Box>
                  <IconButton onClick={() => handleZoom(0.1)} title="Zoom In">
                    <ZoomInIcon />
                  </IconButton>
                  <IconButton onClick={() => handleZoom(-0.1)} title="Zoom Out">
                    <ZoomOutIcon />
                  </IconButton>
                  <IconButton onClick={() => handleRotate(-90)} title="Rotate Left">
                    <RotateLeftIcon />
                  </IconButton>
                  <IconButton onClick={() => handleRotate(90)} title="Rotate Right">
                    <RotateRightIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setIsAnnotating(!isAnnotating)}
                    title="Toggle Annotations"
                  >
                    <EditIcon color={isAnnotating ? "primary" : "inherit"} />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box
                    ref={containerRef}
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "70vh",
                      overflow: "hidden",
                      border: "1px solid #ccc",
                      borderRadius: 1,
                    }}
                  >
                    <Stage
                      ref={stageRef}
                      width={stageSize.width}
                      height={stageSize.height}
                      scaleX={zoom}
                      scaleY={zoom}
                      onClick={handleStageClick}
                    >
                      <Layer>
                        {image && (
                          <Image
                            image={image}
                            rotation={rotation}
                            offsetX={image.width / 2}
                            offsetY={image.height / 2}
                            x={stageSize.width / 2}
                            y={stageSize.height / 2}
                          />
                        )}
                        {annotations.map(renderAnnotation)}
                      </Layer>
                    </Stage>

                    {isAnnotating && (
                      <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                        <Paper elevation={3} sx={{ p: 1 }}>
                          <IconButton onClick={() => handleAddAnnotation("text")} title="Add Text">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleAddAnnotation("highlight")}
                            title="Highlight"
                          >
                            <ZoomInIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    Receipt Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Date</Typography>
                    <Typography>
                      {selectedReceipt.metadata.date
                        ? new Date(selectedReceipt.metadata.date).toLocaleDateString()
                        : "Unknown"}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Amount</Typography>
                    <Typography>
                      {selectedReceipt.metadata.amount
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(selectedReceipt.metadata.amount)
                        : "Unknown"}
                    </Typography>
                  </Box>
                  {selectedReceipt.metadata.text && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        OCR Data
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Text</Typography>
                        <Typography>{selectedReceipt.metadata.text}</Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Confidence</Typography>
                        <Typography>
                          {(selectedReceipt.metadata.confidence || 0 * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      {selectedReceipt.metadata.items && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">Items</Typography>
                          <ul>
                            {selectedReceipt.metadata.items.map((item: LineItem, index: number) => (
                              <li key={index}>
                                {item.description} - ${item.amount.toFixed(2)}
                                {item.quantity && ` x ${item.quantity}`}
                              </li>
                            ))}
                          </ul>
                        </Box>
                      )}
                    </>
                  )}
                  {isAnnotating && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Annotations
                      </Typography>
                      {annotations.map((annotation) => (
                        <Box key={annotation.id} sx={{ mb: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            value={annotation.content}
                            onChange={(e) =>
                              handleAnnotationChange(annotation.id, {
                                content: e.target.value,
                              })
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteAnnotation(annotation.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    );
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Receipt Library</Typography>
        <Stack direction="row" spacing={2}>
          <ExportMenu />
          <Button variant="contained" startIcon={<UploadIcon />} component="label">
            Upload Receipts
            <input
              type="file"
              hidden
              multiple
              accept="image/*,.pdf"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search receipts..."
              value={filters.search}
              onChange={(e) => debouncedSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange.start}
                onChange={(date) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: date },
                  }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="End Date"
                value={filters.dateRange.end}
                onChange={(date) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: date },
                  }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </LocalizationProvider>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              label="Status"
              value={filters.categories.join(", ")}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  categories: e.target.value.split(",").map((s) => s.trim()),
                }))
              }
            >
              <MenuItem value="matched">Matched</MenuItem>
              <MenuItem value="unmatched">Unmatched</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box ref={containerRef} sx={{ height: "calc(100vh - 300px)", overflow: "auto" }}>
          <AnimatePresence>
            <Grid container spacing={3} sx={{ minHeight: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const receipt = filteredReceipts[virtualRow.index];
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={virtualRow.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                      height: `${virtualRow.size}px`,
                    }}
                  >
                    <ReceiptCard receipt={receipt} />
                  </Grid>
                );
              })}
            </Grid>
          </AnimatePresence>
        </Box>
      )}

      <ReceiptDialog />
    </Box>
  );
};
