var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const AnimatedWrapper_1 = __importDefault(require("@/shared/components/AnimatedWrapper"));
const Settings = () => {
  const theme = (0, material_1.useTheme)();
  const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down("sm"));
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };
  return (
    <AnimatedWrapper_1.default>
      <material_1.Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <material_1.Box sx={{ my: { xs: 2, sm: 4 } }}>
          <framer_motion_1.motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <material_1.Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
              Settings
            </material_1.Typography>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div variants={containerAnimation} initial="hidden" animate="show">
            <material_1.Stack spacing={3}>
              {/* Appearance Settings */}
              <framer_motion_1.motion.div variants={itemAnimation}>
                <material_1.Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <material_1.Typography variant="h6" gutterBottom>
                    Appearance
                  </material_1.Typography>
                  <material_1.Divider sx={{ my: 2 }} />
                  <material_1.List disablePadding>
                    <material_1.ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <material_1.ListItemText
                        primary="Dark Mode"
                        secondary="Use dark theme across the application"
                        primaryTypographyProps={{
                          variant: isMobile ? "body2" : "body1",
                        }}
                      />
                      <material_1.Switch />
                    </material_1.ListItem>
                    <material_1.ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <material_1.ListItemText
                        primary="Compact Mode"
                        secondary="Reduce padding and margins for denser layout"
                        primaryTypographyProps={{
                          variant: isMobile ? "body2" : "body1",
                        }}
                      />
                      <material_1.Switch />
                    </material_1.ListItem>
                  </material_1.List>
                </material_1.Paper>
              </framer_motion_1.motion.div>

              {/* Notification Settings */}
              <framer_motion_1.motion.div variants={itemAnimation}>
                <material_1.Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <material_1.Typography variant="h6" gutterBottom>
                    Notifications
                  </material_1.Typography>
                  <material_1.Divider sx={{ my: 2 }} />
                  <material_1.List disablePadding>
                    <material_1.ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <material_1.ListItemText
                        primary="Email Notifications"
                        secondary="Receive updates and alerts via email"
                        primaryTypographyProps={{
                          variant: isMobile ? "body2" : "body1",
                        }}
                      />
                      <material_1.Switch defaultChecked />
                    </material_1.ListItem>
                    <material_1.ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <material_1.ListItemText
                        primary="Push Notifications"
                        secondary="Receive instant notifications in your browser"
                        primaryTypographyProps={{
                          variant: isMobile ? "body2" : "body1",
                        }}
                      />
                      <material_1.Switch defaultChecked />
                    </material_1.ListItem>
                  </material_1.List>
                </material_1.Paper>
              </framer_motion_1.motion.div>

              {/* Preferences */}
              <framer_motion_1.motion.div variants={itemAnimation}>
                <material_1.Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <material_1.Typography variant="h6" gutterBottom>
                    Preferences
                  </material_1.Typography>
                  <material_1.Divider sx={{ my: 2 }} />
                  <material_1.Stack spacing={3}>
                    <material_1.FormControl fullWidth>
                      <material_1.InputLabel id="currency-label">
                        Default Currency
                      </material_1.InputLabel>
                      <material_1.Select
                        labelId="currency-label"
                        defaultValue="USD"
                        label="Default Currency"
                        size={isMobile ? "small" : "medium"}
                      >
                        <material_1.MenuItem value="USD">USD ($)</material_1.MenuItem>
                        <material_1.MenuItem value="EUR">EUR (€)</material_1.MenuItem>
                        <material_1.MenuItem value="GBP">GBP (£)</material_1.MenuItem>
                      </material_1.Select>
                    </material_1.FormControl>

                    <material_1.FormControl fullWidth>
                      <material_1.InputLabel id="date-format-label">
                        Date Format
                      </material_1.InputLabel>
                      <material_1.Select
                        labelId="date-format-label"
                        defaultValue="MM/DD/YYYY"
                        label="Date Format"
                        size={isMobile ? "small" : "medium"}
                      >
                        <material_1.MenuItem value="MM/DD/YYYY">MM/DD/YYYY</material_1.MenuItem>
                        <material_1.MenuItem value="DD/MM/YYYY">DD/MM/YYYY</material_1.MenuItem>
                        <material_1.MenuItem value="YYYY-MM-DD">YYYY-MM-DD</material_1.MenuItem>
                      </material_1.Select>
                    </material_1.FormControl>
                  </material_1.Stack>
                </material_1.Paper>
              </framer_motion_1.motion.div>
            </material_1.Stack>
          </framer_motion_1.motion.div>
        </material_1.Box>
      </material_1.Container>
    </AnimatedWrapper_1.default>
  );
};
exports.default = Settings;
//# sourceMappingURL=Settings.js.map
