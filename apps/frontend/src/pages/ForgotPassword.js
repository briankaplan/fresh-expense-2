const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
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
const __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
const __importStar =
  (this && this.__importStar) ||
  (() => {
    let ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          const ar = [];
          for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) return mod;
      const result = {};
      if (mod != null)
        for (let k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const AuthContext_1 = require("../context/AuthContext");
const react_router_dom_1 = require("react-router-dom");
const material_2 = require("@mui/material");
const react_hot_toast_1 = require("react-hot-toast");
const icons_material_1 = require("@mui/icons-material");
const ForgotPassword = () => {
  const [email, setEmail] = (0, react_1.useState)("");
  const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
  const { forgotPassword } = (0, AuthContext_1.useAuth)();
  const navigate = (0, react_router_dom_1.useNavigate)();
  const theme = (0, material_1.useTheme)();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      react_hot_toast_1.toast.success("Password reset instructions have been sent to your email");
      navigate("/login");
    } catch (error) {
      react_hot_toast_1.toast.error("Failed to send reset instructions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <material_1.Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.palette.background.default,
        backgroundImage: `radial-gradient(at 50% 0%, ${theme.palette.primary.dark}29 0%, transparent 50%), 
                         radial-gradient(at 100% 0%, ${theme.palette.secondary.dark}29 0%, transparent 50%)`,
        p: 2,
      }}
    >
      <framer_motion_1.motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 400 }}
      >
        <material_1.Card
          sx={{
            width: "100%",
            background: "rgba(26, 27, 30, 0.7)",
            backdropFilter: "blur(20px)",
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          <material_1.CardContent sx={{ p: 4 }}>
            <material_1.Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                mb: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Reset Password
            </material_1.Typography>

            <material_1.Typography
              variant="body1"
              sx={{
                mb: 4,
                textAlign: "center",
                color: "text.secondary",
                opacity: 0.8,
              }}
            >
              Enter your email address and we'll send you instructions to reset your password.
            </material_1.Typography>

            <form onSubmit={handleSubmit}>
              <material_1.TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <material_1.InputAdornment position="start">
                      <icons_material_1.Email sx={{ color: theme.palette.primary.main }} />
                    </material_1.InputAdornment>
                  ),
                }}
              />

              <material_1.Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  mb: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  "&:hover": {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  },
                  "&:disabled": {
                    background: theme.palette.action.disabledBackground,
                  },
                }}
              >
                {isSubmitting ? "Sending..." : "Send Reset Instructions"}
              </material_1.Button>

              <material_1.Typography variant="body2" align="center">
                Remember your password?{" "}
                <material_2.Link
                  component={react_router_dom_1.Link}
                  to="/login"
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                      color: theme.palette.primary.light,
                    },
                  }}
                >
                  Back to Login
                </material_2.Link>
              </material_1.Typography>
            </form>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>
    </material_1.Box>
  );
};
exports.default = ForgotPassword;
//# sourceMappingURL=ForgotPassword.js.map
