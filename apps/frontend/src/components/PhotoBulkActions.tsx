import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Label as LabelIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Photo } from '@/services/photo.service';

interface PhotoBulkActionsProps {
  selectedPhotos: Photo[];
  onDelete: (photoIds: string[]) => void;
  onEdit: (photoIds: string[]) => void;
  onTag: (photoIds: string[], tags: string[]) => void;
  onShare: (photoIds: string[]) => void;
  onDownload: (photoIds: string[]) => void;
  availableTags: string[];
}

export function PhotoBulkActions({
  selectedPhotos,
  onDelete,
  onEdit,
  onTag,
  onShare,
  onDownload,
  availableTags,
}: PhotoBulkActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    try {
      onDelete(selectedPhotos.map(photo => photo.id));
      handleMenuClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete photos';
      setError(errorMessage);
      console.error('Error deleting photos:', err);
    }
  };

  const handleEdit = () => {
    try {
      onEdit(selectedPhotos.map(photo => photo.id));
      handleMenuClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit photos';
      setError(errorMessage);
      console.error('Error editing photos:', err);
    }
  };

  const handleTag = () => {
    try {
      if (tags.length === 0) {
        setError('Please add at least one tag');
        return;
      }
      onTag(
        selectedPhotos.map(photo => photo.id),
        tags
      );
      setTags([]);
      setIsTagDialogOpen(false);
      handleMenuClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add tags';
      setError(errorMessage);
      console.error('Error adding tags:', err);
    }
  };

  const handleShare = () => {
    try {
      onShare(selectedPhotos.map(photo => photo.id));
      handleMenuClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share photos';
      setError(errorMessage);
      console.error('Error sharing photos:', err);
    }
  };

  const handleDownload = () => {
    try {
      onDownload(selectedPhotos.map(photo => photo.id));
      handleMenuClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download photos';
      setError(errorMessage);
      console.error('Error downloading photos:', err);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {selectedPhotos.length} selected
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
        <MenuItem onClick={() => setIsTagDialogOpen(true)}>
          <LabelIcon fontSize="small" sx={{ mr: 1 }} />
          Add Tags
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Download Selected
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />
          Share Selected
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Selected
        </MenuItem>
      </Menu>

      <Dialog
        open={isTagDialogOpen}
        onClose={() => setIsTagDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Tags to Selected Photos</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Autocomplete
            multiple
            freeSolo
            options={availableTags}
            value={tags}
            onChange={(_, newValue) => {
              setTags(newValue);
              setError('');
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={option} label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={params => (
              <TextField {...params} autoFocus fullWidth label="Tags" placeholder="Add tags..." />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTagDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleTag} variant="contained">
            Apply Tags
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
