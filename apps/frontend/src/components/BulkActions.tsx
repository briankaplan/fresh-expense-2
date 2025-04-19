import type { Expense } from "@/services/expense.service";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Label as LabelIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";

interface BulkActionsProps {
  selectedExpenses: Expense[];
  onDelete: (expenseIds: string[]) => void;
  onEdit: (expenseIds: string[]) => void;
  onLabel: (expenseIds: string[], label: string) => void;
  onShare: (expenseIds: string[]) => void;
}

export function BulkActions({
  selectedExpenses,
  onDelete,
  onEdit,
  onLabel,
  onShare,
}: BulkActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    onDelete(selectedExpenses.map((expense) => expense.id));
    handleMenuClose();
  };

  const handleEdit = () => {
    onEdit(selectedExpenses.map((expense) => expense.id));
    handleMenuClose();
  };

  const handleLabel = () => {
    if (!label.trim()) {
      setError("Please enter a label");
      return;
    }
    onLabel(
      selectedExpenses.map((expense) => expense.id),
      label,
    );
    setLabel("");
    setIsLabelDialogOpen(false);
    handleMenuClose();
  };

  const handleShare = () => {
    onShare(selectedExpenses.map((expense) => expense.id));
    handleMenuClose();
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {selectedExpenses.length} selected
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleMenuClick}
          endIcon={<MoreVertIcon />}
        >
          Actions
        </Button>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Selected
        </MenuItem>
        <MenuItem onClick={() => setIsLabelDialogOpen(true)}>
          <LabelIcon fontSize="small" sx={{ mr: 1 }} />
          Add Label
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />
          Share Selected
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Selected
        </MenuItem>
      </Menu>

      <Dialog
        open={isLabelDialogOpen}
        onClose={() => setIsLabelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Label to Selected Expenses</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            label="Label"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              setError("");
            }}
            onKeyPress={(e) => e.key === "Enter" && handleLabel()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLabelDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLabel} variant="contained">
            Apply Label
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
