import type { ExpenseFilter } from "@/services/expense.service";
import FilterPresetService, { type FilterPreset } from "@/services/filter-preset.service";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";

interface FilterPresetManagerProps {
  open: boolean;
  onClose: () => void;
  currentFilters: ExpenseFilter;
  onApplyPreset: (filters: ExpenseFilter) => void;
}

export function FilterPresetManager({
  open,
  onClose,
  currentFilters,
  onApplyPreset,
}: FilterPresetManagerProps) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPreset, setSelectedPreset] = useState<FilterPreset | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filterPresetService = FilterPresetService.getInstance();

  useEffect(() => {
    if (open) {
      loadPresets();
    }
  }, [open]);

  const loadPresets = async () => {
    const loadedPresets = await filterPresetService.getPresets();
    setPresets(loadedPresets);
  };

  const handleCreatePreset = async () => {
    if (!newPresetName.trim()) return;

    const newPreset = {
      name: newPresetName,
      filters: currentFilters,
    };

    await filterPresetService.createPreset(newPreset);
    setNewPresetName("");
    setIsCreating(false);
    loadPresets();
  };

  const handleDeletePreset = async (preset: FilterPreset) => {
    await filterPresetService.deletePreset(preset.id);
    loadPresets();
  };

  const handleSetDefault = async (preset: FilterPreset) => {
    await filterPresetService.setDefaultPreset(preset.id);
    loadPresets();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, preset: FilterPreset) => {
    setAnchorEl(event.currentTarget);
    setSelectedPreset(preset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPreset(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Filter Presets</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          {!isCreating ? (
            <Button
              startIcon={<AddIcon />}
              onClick={() => setIsCreating(true)}
              variant="outlined"
              fullWidth
            >
              Save Current Filters as Preset
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                autoFocus
                fullWidth
                label="Preset Name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreatePreset()}
              />
              <Button onClick={handleCreatePreset} variant="contained">
                Save
              </Button>
              <Button onClick={() => setIsCreating(false)}>Cancel</Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <List>
          {presets.map((preset) => (
            <ListItem key={preset.id} button onClick={() => onApplyPreset(preset.filters)}>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {preset.name}
                    {preset.isDefault && <StarIcon color="primary" fontSize="small" />}
                  </Box>
                }
                secondary={preset.description}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={(e) => handleMenuClick(e, preset)}>
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem
            onClick={() => {
              if (selectedPreset) {
                handleSetDefault(selectedPreset);
              }
              handleMenuClose();
            }}
          >
            {selectedPreset?.isDefault ? (
              <>
                <StarIcon fontSize="small" sx={{ mr: 1 }} />
                Remove as Default
              </>
            ) : (
              <>
                <StarBorderIcon fontSize="small" sx={{ mr: 1 }} />
                Set as Default
              </>
            )}
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedPreset) {
                handleDeletePreset(selectedPreset);
              }
              handleMenuClose();
            }}
            sx={{ color: "error.main" }}
          >
            Delete Preset
          </MenuItem>
        </Menu>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
