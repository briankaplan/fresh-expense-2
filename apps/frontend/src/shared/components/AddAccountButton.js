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
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Add_1 = __importDefault(require("@mui/icons-material/Add"));
const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'credit', label: 'Credit Card' },
];
const AddAccountButton = ({ fullWidth = false }) => {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        type: '',
        institution: '',
        lastFour: '',
    });
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement account creation logic
        console.log('Creating account:', formData);
        handleClose();
    };
    return (<>
      <material_1.Button variant="contained" startIcon={<Add_1.default />} onClick={handleOpen} fullWidth={fullWidth}>
        Add Account
      </material_1.Button>

      <material_1.Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <material_1.DialogTitle>Add New Account</material_1.DialogTitle>
        <form onSubmit={handleSubmit}>
          <material_1.DialogContent>
            <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <material_1.TextField name="name" label="Account Name" value={formData.name} onChange={handleChange} fullWidth required/>
              <material_1.TextField name="type" label="Account Type" select value={formData.type} onChange={handleChange} fullWidth required>
                {accountTypes.map(option => (<material_1.MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </material_1.MenuItem>))}
              </material_1.TextField>
              <material_1.TextField name="institution" label="Financial Institution" value={formData.institution} onChange={handleChange} fullWidth required/>
              <material_1.TextField name="lastFour" label="Last 4 Digits" value={formData.lastFour} onChange={handleChange} fullWidth required inputProps={{ maxLength: 4, pattern: '[0-9]*' }}/>
            </material_1.Box>
          </material_1.DialogContent>
          <material_1.DialogActions>
            <material_1.Button onClick={handleClose}>Cancel</material_1.Button>
            <material_1.Button type="submit" variant="contained" color="primary">
              Add Account
            </material_1.Button>
          </material_1.DialogActions>
        </form>
      </material_1.Dialog>
    </>);
};
exports.default = AddAccountButton;
//# sourceMappingURL=AddAccountButton.js.map