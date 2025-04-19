const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const AccountsList_1 = __importDefault(require("@/shared/components/AccountsList"));
const AddAccountButton_1 = __importDefault(require("@/shared/components/AddAccountButton"));
const AnimatedWrapper_1 = __importDefault(require("@/shared/components/AnimatedWrapper"));
const Accounts = () => {
  const theme = (0, material_1.useTheme)();
  const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down("sm"));
  return (
    <AnimatedWrapper_1.default>
      <material_1.Box sx={{ p: { xs: 2, sm: 3 } }}>
        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <material_1.Grid
            container
            spacing={2}
            alignItems="center"
            sx={{
              mb: 3,
              flexDirection: { xs: "column", sm: "row" },
              "& > .MuiGrid-item": {
                width: { xs: "100%", sm: "auto" },
              },
            }}
          >
            <material_1.Grid item xs>
              <material_1.Typography
                variant="h4"
                sx={{
                  textAlign: { xs: "center", sm: "left" },
                  mb: { xs: 2, sm: 0 },
                }}
              >
                Accounts
              </material_1.Typography>
            </material_1.Grid>
            <material_1.Grid
              item
              sx={{
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <AddAccountButton_1.default fullWidth={isMobile} />
            </material_1.Grid>
          </material_1.Grid>
        </framer_motion_1.motion.div>

        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <material_1.Paper
            sx={{
              p: { xs: 1.5, sm: 2 },
              overflowX: "auto",
            }}
          >
            <AccountsList_1.default />
          </material_1.Paper>
        </framer_motion_1.motion.div>
      </material_1.Box>
    </AnimatedWrapper_1.default>
  );
};
exports.default = Accounts;
//# sourceMappingURL=Accounts.js.map
