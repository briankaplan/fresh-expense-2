"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatCard = void 0;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const icons_1 = require("../icons");
const framer_motion_1 = require("framer-motion");
const StatCard = ({ title, value, icon, trend, color }) => {
    const theme = (0, material_1.useTheme)();
    const IconComponent = icon ? icons_1.Icons[icon].Filled : null;
    const defaultColor = theme.palette.primary.main;
    return (<framer_motion_1.motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
        }}>
      <material_1.Box sx={{
            p: 2,
            borderRadius: theme.shape.borderRadius,
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
            },
        }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {IconComponent && (<material_1.Box component={framer_motion_1.motion.div} whileHover={{ scale: 1.1 }} sx={{
                mr: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: color || defaultColor,
                color: theme.palette.common.white,
            }}>
              <IconComponent />
            </material_1.Box>)}
          <material_1.Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {title}
          </material_1.Typography>
        </material_1.Box>

        <material_1.Box sx={{ display: 'flex', alignItems: 'baseline' }}>
          <material_1.Typography variant="h4" component={framer_motion_1.motion.h4} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} sx={{ fontWeight: 600 }}>
            {value}
          </material_1.Typography>

          {trend && (<material_1.Box component={framer_motion_1.motion.div} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} sx={{
                display: 'flex',
                alignItems: 'center',
                ml: 1,
                color: trend.isPositive ? theme.palette.success.main : theme.palette.error.main,
            }}>
              {trend.isPositive ? (<icons_1.Icons.Success.Filled fontSize="small"/>) : (<icons_1.Icons.Error.Filled fontSize="small"/>)}
              <material_1.Typography variant="caption" sx={{ ml: 0.5 }}>
                {trend.value}%
              </material_1.Typography>
            </material_1.Box>)}
        </material_1.Box>
      </material_1.Box>
    </framer_motion_1.motion.div>);
};
exports.StatCard = StatCard;
//# sourceMappingURL=StatCard.js.map