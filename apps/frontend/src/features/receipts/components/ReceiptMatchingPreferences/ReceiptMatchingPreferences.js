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
exports.ReceiptMatchingPreferences = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const defaultPreferences = {
  weights: {
    merchant: 0.4,
    amount: 0.3,
    date: 0.2,
    location: 0.05,
    category: 0.05,
    paymentMethod: 0,
    text: 0,
  },
  amountTolerance: 0.1,
  dateRangeDays: 3,
  merchantMatchThreshold: 0.8,
};
const ReceiptMatchingPreferences = ({ onSave, initialPreferences = defaultPreferences }) => {
  const [preferences, setPreferences] = (0, react_1.useState)(initialPreferences);
  const [isEditing, setIsEditing] = (0, react_1.useState)(false);
  const handleWeightChange = (key) => (_, value) => {
    setPreferences((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: value,
      },
    }));
  };
  const handleThresholdChange = (key) => (_, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const handleSave = () => {
    onSave(preferences);
    setIsEditing(false);
  };
  return (
    <material_1.Card>
      <material_1.CardContent>
        <material_1.Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <material_1.Typography variant="h6">Receipt Matching Preferences</material_1.Typography>
          <material_1.FormControlLabel
            control={
              <material_1.Switch
                checked={isEditing}
                onChange={(e) => setIsEditing(e.target.checked)}
              />
            }
            label="Edit Preferences"
          />
        </material_1.Box>

        <material_1.Grid container spacing={3}>
          <material_1.Grid item xs={12}>
            <material_1.Typography gutterBottom>Matching Weights</material_1.Typography>
            {Object.entries(preferences.weights).map(([key, value]) => (
              <material_1.Box key={key} mb={2}>
                <material_1.Typography variant="body2" gutterBottom>
                  {key.charAt(0).toUpperCase() + key.slice(1)} Weight
                </material_1.Typography>
                <material_1.Slider
                  value={value}
                  onChange={handleWeightChange(key)}
                  min={0}
                  max={1}
                  step={0.05}
                  disabled={!isEditing}
                  valueLabelDisplay="auto"
                />
              </material_1.Box>
            ))}
          </material_1.Grid>

          <material_1.Grid item xs={12} md={4}>
            <material_1.Typography gutterBottom>Amount Tolerance</material_1.Typography>
            <material_1.Slider
              value={preferences.amountTolerance}
              onChange={handleThresholdChange("amountTolerance")}
              min={0}
              max={0.5}
              step={0.01}
              disabled={!isEditing}
              valueLabelDisplay="auto"
            />
          </material_1.Grid>

          <material_1.Grid item xs={12} md={4}>
            <material_1.Typography gutterBottom>Date Range (Days)</material_1.Typography>
            <material_1.Slider
              value={preferences.dateRangeDays}
              onChange={handleThresholdChange("dateRangeDays")}
              min={1}
              max={7}
              step={1}
              disabled={!isEditing}
              valueLabelDisplay="auto"
            />
          </material_1.Grid>

          <material_1.Grid item xs={12} md={4}>
            <material_1.Typography gutterBottom>Merchant Match Threshold</material_1.Typography>
            <material_1.Slider
              value={preferences.merchantMatchThreshold}
              onChange={handleThresholdChange("merchantMatchThreshold")}
              min={0.5}
              max={1}
              step={0.05}
              disabled={!isEditing}
              valueLabelDisplay="auto"
            />
          </material_1.Grid>
        </material_1.Grid>

        {isEditing && (
          <material_1.Box mt={3} display="flex" justifyContent="flex-end">
            <material_1.Button variant="contained" color="primary" onClick={handleSave}>
              Save Preferences
            </material_1.Button>
          </material_1.Box>
        )}
      </material_1.CardContent>
    </material_1.Card>
  );
};
exports.ReceiptMatchingPreferences = ReceiptMatchingPreferences;
//# sourceMappingURL=ReceiptMatchingPreferences.js.map
