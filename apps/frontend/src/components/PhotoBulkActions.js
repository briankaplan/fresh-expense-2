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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoBulkActions = PhotoBulkActions;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
function PhotoBulkActions({ selectedPhotos, onDelete, onEdit, onTag, onShare, onDownload, availableTags, }) {
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const [isTagDialogOpen, setIsTagDialogOpen] = (0, react_1.useState)(false);
    const [tags, setTags] = (0, react_1.useState)([]);
    const [error, setError] = (0, react_1.useState)('');
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleDelete = () => {
        try {
            onDelete(selectedPhotos.map(photo => photo.id));
            handleMenuClose();
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete photos';
            setError(errorMessage);
            console.error('Error deleting photos:', err);
        }
    };
    const handleEdit = () => {
        try {
            onEdit(selectedPhotos.map(photo => photo.id));
            handleMenuClose();
        }
        catch (err) {
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
            onTag(selectedPhotos.map(photo => photo.id), tags);
            setTags([]);
            setIsTagDialogOpen(false);
            handleMenuClose();
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add tags';
            setError(errorMessage);
            console.error('Error adding tags:', err);
        }
    };
    const handleShare = () => {
        try {
            onShare(selectedPhotos.map(photo => photo.id));
            handleMenuClose();
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to share photos';
            setError(errorMessage);
            console.error('Error sharing photos:', err);
        }
    };
    const handleDownload = () => {
        try {
            onDownload(selectedPhotos.map(photo => photo.id));
            handleMenuClose();
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to download photos';
            setError(errorMessage);
            console.error('Error downloading photos:', err);
        }
    };
    return (<>
      <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <material_1.Typography variant="body2" color="text.secondary">
          {selectedPhotos.length} selected
        </material_1.Typography>
        <material_1.Button variant="outlined" size="small" onClick={handleMenuClick} endIcon={<icons_material_1.MoreVert />}>
          Actions
        </material_1.Button>
      </material_1.Box>

      <material_1.Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <material_1.MenuItem onClick={handleEdit}>
          <icons_material_1.Edit fontSize="small" sx={{ mr: 1 }}/>
          Edit Selected
        </material_1.MenuItem>
        <material_1.MenuItem onClick={() => setIsTagDialogOpen(true)}>
          <icons_material_1.Label fontSize="small" sx={{ mr: 1 }}/>
          Add Tags
        </material_1.MenuItem>
        <material_1.MenuItem onClick={handleDownload}>
          <icons_material_1.Download fontSize="small" sx={{ mr: 1 }}/>
          Download Selected
        </material_1.MenuItem>
        <material_1.MenuItem onClick={handleShare}>
          <icons_material_1.Share fontSize="small" sx={{ mr: 1 }}/>
          Share Selected
        </material_1.MenuItem>
        <material_1.MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <icons_material_1.Delete fontSize="small" sx={{ mr: 1 }}/>
          Delete Selected
        </material_1.MenuItem>
      </material_1.Menu>

      <material_1.Dialog open={isTagDialogOpen} onClose={() => setIsTagDialogOpen(false)} maxWidth="sm" fullWidth>
        <material_1.DialogTitle>Add Tags to Selected Photos</material_1.DialogTitle>
        <material_1.DialogContent>
          {error && (<material_1.Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </material_1.Alert>)}
          <material_1.Autocomplete multiple freeSolo options={availableTags} value={tags} onChange={(_, newValue) => {
            setTags(newValue);
            setError('');
        }} renderTags={(value, getTagProps) => value.map((option, index) => (<material_1.Chip key={option} label={option} {...getTagProps({ index })}/>))} renderInput={params => (<material_1.TextField {...params} autoFocus fullWidth label="Tags" placeholder="Add tags..."/>)}/>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setIsTagDialogOpen(false)}>Cancel</material_1.Button>
          <material_1.Button onClick={handleTag} variant="contained">
            Apply Tags
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </>);
}
//# sourceMappingURL=PhotoBulkActions.js.map