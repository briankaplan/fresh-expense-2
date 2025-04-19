"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircularProgress = void 0;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const material_2 = require("@mui/material");
const CircularProgress = ({ value, total, label, size = 120, thickness = 4, showPercentage = true, }) => {
    const theme = (0, material_1.useTheme)();
    const percentage = Math.min(Math.round((value / total) * 100), 100);
    const isOverBudget = value > total;
    const getColor = () => {
        if (isOverBudget)
            return theme.palette.error.main;
        if (percentage >= 90)
            return theme.palette.warning.main;
        return theme.palette.primary.main;
    };
    return (<material_1.Box sx={{
            position: 'relative',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
      <material_1.Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <material_2.CircularProgress variant="determinate" value={100} size={size} thickness={thickness} sx={{ color: theme.palette.grey[200] }}/>
        <material_2.CircularProgress variant="determinate" value={percentage} size={size} thickness={thickness} sx={{
            color: getColor(),
            position: 'absolute',
            left: 0,
            transition: 'all 0.3s ease-in-out',
        }}/>
        <material_1.Box sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
        }}>
          {showPercentage && (<material_1.Typography variant="h6" component="div" color={getColor()} sx={{ lineHeight: 1 }}>
              {percentage}%
            </material_1.Typography>)}
        </material_1.Box>
      </material_1.Box>
      <material_1.Typography variant="subtitle2" component="div" color="text.secondary" sx={{ mt: 1 }}>
        {label}
      </material_1.Typography>
    </material_1.Box>);
};
exports.CircularProgress = CircularProgress;
//# sourceMappingURL=CircularProgress.js.map