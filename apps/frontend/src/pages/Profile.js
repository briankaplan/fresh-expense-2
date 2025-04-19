"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const AuthContext_1 = require("../context/AuthContext");
const AnimatedWrapper_1 = __importDefault(require("@/shared/components/AnimatedWrapper"));
const Profile = () => {
    const { user } = (0, AuthContext_1.useAuth)();
    const theme = (0, material_1.useTheme)();
    const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down('sm'));
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
    return (<AnimatedWrapper_1.default>
      <material_1.Box sx={{ p: { xs: 2, sm: 3 } }}>
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <material_1.Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Profile
          </material_1.Typography>
        </framer_motion_1.motion.div>

        <material_1.Grid container spacing={3}>
          <material_1.Grid item xs={12} md={4}>
            <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
              <material_1.Paper sx={{
            p: { xs: 2, sm: 3 },
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
                <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.3,
        }}>
                  <material_1.Avatar sx={{
            width: { xs: 80, sm: 100 },
            height: { xs: 80, sm: 100 },
            fontSize: { xs: '2rem', sm: '2.5rem' },
            margin: '0 auto 16px',
            bgcolor: 'primary.main',
        }}>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </material_1.Avatar>
                </framer_motion_1.motion.div>
                <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <material_1.Typography variant="h6" sx={{ mb: 1 }}>
                    {user?.firstName} {user?.lastName}
                  </material_1.Typography>
                  <material_1.Typography color="textSecondary" gutterBottom>
                    {user?.email}
                  </material_1.Typography>
                  <material_1.Button variant="outlined" sx={{
            mt: 2,
            width: { xs: '100%', sm: 'auto' },
        }}>
                    Edit Profile
                  </material_1.Button>
                </framer_motion_1.motion.div>
              </material_1.Paper>
            </framer_motion_1.motion.div>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={8}>
            <framer_motion_1.motion.div variants={containerAnimation} initial="hidden" animate="show">
              <material_1.Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <framer_motion_1.motion.div variants={itemAnimation}>
                  <material_1.Typography variant="h6" gutterBottom>
                    Account Information
                  </material_1.Typography>
                </framer_motion_1.motion.div>
                <material_1.List>
                  <framer_motion_1.motion.div variants={itemAnimation}>
                    <material_1.ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <material_1.ListItemText primary="Email" secondary={user?.email} primaryTypographyProps={{
            variant: isMobile ? 'body2' : 'body1',
        }}/>
                    </material_1.ListItem>
                    <material_1.Divider />
                  </framer_motion_1.motion.div>
                  <framer_motion_1.motion.div variants={itemAnimation}>
                    <material_1.ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <material_1.ListItemText primary="Role" secondary={user?.role} primaryTypographyProps={{
            variant: isMobile ? 'body2' : 'body1',
        }}/>
                    </material_1.ListItem>
                    <material_1.Divider />
                  </framer_motion_1.motion.div>
                  <framer_motion_1.motion.div variants={itemAnimation}>
                    <material_1.ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <material_1.ListItemText primary="Member Since" secondary="March 2024" primaryTypographyProps={{
            variant: isMobile ? 'body2' : 'body1',
        }}/>
                    </material_1.ListItem>
                  </framer_motion_1.motion.div>
                </material_1.List>
                <material_1.Box sx={{ mt: 3 }}>
                  <framer_motion_1.motion.div variants={itemAnimation}>
                    <material_1.Typography variant="h6" gutterBottom>
                      Security
                    </material_1.Typography>
                  </framer_motion_1.motion.div>
                  <framer_motion_1.motion.div variants={itemAnimation} transition={{ delay: 0.2 }}>
                    <material_1.Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                      <material_1.Button variant="outlined" color="primary" fullWidth={isMobile}>
                        Change Password
                      </material_1.Button>
                      <material_1.Button variant="outlined" color="error" fullWidth={isMobile}>
                        Delete Account
                      </material_1.Button>
                    </material_1.Stack>
                  </framer_motion_1.motion.div>
                </material_1.Box>
              </material_1.Paper>
            </framer_motion_1.motion.div>
          </material_1.Grid>
        </material_1.Grid>
      </material_1.Box>
    </AnimatedWrapper_1.default>);
};
exports.default = Profile;
//# sourceMappingURL=Profile.js.map