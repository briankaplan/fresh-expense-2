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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterPresetManager = FilterPresetManager;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const filter_preset_service_1 = __importDefault(require("@/services/filter-preset.service"));
function FilterPresetManager({ open, onClose, currentFilters, onApplyPreset, }) {
    const [presets, setPresets] = (0, react_1.useState)([]);
    const [newPresetName, setNewPresetName] = (0, react_1.useState)('');
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const [selectedPreset, setSelectedPreset] = (0, react_1.useState)(null);
    const [isCreating, setIsCreating] = (0, react_1.useState)(false);
    const filterPresetService = filter_preset_service_1.default.getInstance();
    (0, react_1.useEffect)(() => {
        if (open) {
            loadPresets();
        }
    }, [open]);
    const loadPresets = async () => {
        const loadedPresets = await filterPresetService.getPresets();
        setPresets(loadedPresets);
    };
    const handleCreatePreset = async () => {
        if (!newPresetName.trim())
            return;
        const newPreset = {
            name: newPresetName,
            filters: currentFilters,
        };
        await filterPresetService.createPreset(newPreset);
        setNewPresetName('');
        setIsCreating(false);
        loadPresets();
    };
    const handleDeletePreset = async (preset) => {
        await filterPresetService.deletePreset(preset.id);
        loadPresets();
    };
    const handleSetDefault = async (preset) => {
        await filterPresetService.setDefaultPreset(preset.id);
        loadPresets();
    };
    const handleMenuClick = (event, preset) => {
        setAnchorEl(event.currentTarget);
        setSelectedPreset(preset);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedPreset(null);
    };
    return (<material_1.Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <material_1.DialogTitle>Manage Filter Presets</material_1.DialogTitle>
      <material_1.DialogContent>
        <material_1.Box sx={{ mb: 2 }}>
          {!isCreating ? (<material_1.Button startIcon={<icons_material_1.Add />} onClick={() => setIsCreating(true)} variant="outlined" fullWidth>
              Save Current Filters as Preset
            </material_1.Button>) : (<material_1.Box sx={{ display: 'flex', gap: 1 }}>
              <material_1.TextField autoFocus fullWidth label="Preset Name" value={newPresetName} onChange={e => setNewPresetName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleCreatePreset()}/>
              <material_1.Button onClick={handleCreatePreset} variant="contained">
                Save
              </material_1.Button>
              <material_1.Button onClick={() => setIsCreating(false)}>Cancel</material_1.Button>
            </material_1.Box>)}
        </material_1.Box>

        <material_1.Divider sx={{ my: 2 }}/>

        <material_1.List>
          {presets.map(preset => (<material_1.ListItem key={preset.id} button onClick={() => onApplyPreset(preset.filters)}>
              <material_1.ListItemText primary={<material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {preset.name}
                    {preset.isDefault && <icons_material_1.Star color="primary" fontSize="small"/>}
                  </material_1.Box>} secondary={preset.description}/>
              <material_1.ListItemSecondaryAction>
                <material_1.IconButton edge="end" onClick={e => handleMenuClick(e, preset)}>
                  <icons_material_1.MoreVert />
                </material_1.IconButton>
              </material_1.ListItemSecondaryAction>
            </material_1.ListItem>))}
        </material_1.List>

        <material_1.Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <material_1.MenuItem onClick={() => {
            if (selectedPreset) {
                handleSetDefault(selectedPreset);
            }
            handleMenuClose();
        }}>
            {selectedPreset?.isDefault ? (<>
                <icons_material_1.Star fontSize="small" sx={{ mr: 1 }}/>
                Remove as Default
              </>) : (<>
                <icons_material_1.StarBorder fontSize="small" sx={{ mr: 1 }}/>
                Set as Default
              </>)}
          </material_1.MenuItem>
          <material_1.MenuItem onClick={() => {
            if (selectedPreset) {
                handleDeletePreset(selectedPreset);
            }
            handleMenuClose();
        }} sx={{ color: 'error.main' }}>
            Delete Preset
          </material_1.MenuItem>
        </material_1.Menu>
      </material_1.DialogContent>
      <material_1.DialogActions>
        <material_1.Button onClick={onClose}>Close</material_1.Button>
      </material_1.DialogActions>
    </material_1.Dialog>);
}
//# sourceMappingURL=FilterPresetManager.js.map