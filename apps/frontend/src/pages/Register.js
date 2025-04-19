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
exports.default = Register;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const AuthContext_1 = require("@/context/AuthContext");
const framer_motion_1 = require("framer-motion");
function Register() {
  const [formData, setFormData] = (0, react_1.useState)({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
  });
  const [showPassword, setShowPassword] = (0, react_1.useState)(false);
  const [error, setError] = (0, react_1.useState)("");
  const { register } = (0, AuthContext_1.useAuth)();
  const navigate = (0, react_router_dom_1.useNavigate)();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };
  return (
    <material_1.Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <material_1.Container maxWidth="sm">
        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <material_1.Paper
            elevation={24}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
              background: "rgba(255, 255, 255, 0.95)",
            }}
          >
            <material_1.Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: "bold",
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Create Account
            </material_1.Typography>

            {error && (
              <material_1.Fade in={!!error}>
                <material_1.Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                  {error}
                </material_1.Alert>
              </material_1.Fade>
            )}

            <material_1.Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <material_1.Grid container spacing={2}>
                <material_1.Grid item xs={12} sm={6}>
                  <material_1.TextField
                    required
                    fullWidth
                    name="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <material_1.InputAdornment position="start">
                          <icons_material_1.Person color="primary" />
                        </material_1.InputAdornment>
                      ),
                    }}
                  />
                </material_1.Grid>
                <material_1.Grid item xs={12} sm={6}>
                  <material_1.TextField
                    required
                    fullWidth
                    name="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <material_1.InputAdornment position="start">
                          <icons_material_1.Person color="primary" />
                        </material_1.InputAdornment>
                      ),
                    }}
                  />
                </material_1.Grid>
              </material_1.Grid>

              <material_1.TextField
                margin="normal"
                required
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <material_1.InputAdornment position="start">
                      <icons_material_1.Email color="primary" />
                    </material_1.InputAdornment>
                  ),
                }}
                sx={{ mt: 2 }}
              />

              <material_1.TextField
                margin="normal"
                required
                fullWidth
                name="companyName"
                label="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <material_1.InputAdornment position="start">
                      <icons_material_1.Business color="primary" />
                    </material_1.InputAdornment>
                  ),
                }}
                sx={{ mt: 2 }}
              />

              <material_1.TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <material_1.InputAdornment position="start">
                      <icons_material_1.Lock color="primary" />
                    </material_1.InputAdornment>
                  ),
                  endAdornment: (
                    <material_1.InputAdornment position="end">
                      <material_1.IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <icons_material_1.VisibilityOff />
                        ) : (
                          <icons_material_1.Visibility />
                        )}
                      </material_1.IconButton>
                    </material_1.InputAdornment>
                  ),
                }}
                sx={{ mt: 2 }}
              />

              <material_1.Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #764ba2, #667eea)",
                  },
                }}
              >
                Sign Up
              </material_1.Button>

              <material_1.Typography variant="body2" sx={{ textAlign: "center" }}>
                Already have an account?{" "}
                <react_router_dom_1.Link
                  to="/login"
                  style={{
                    textDecoration: "none",
                    color: "#667eea",
                    fontWeight: "bold",
                  }}
                >
                  Sign in
                </react_router_dom_1.Link>
              </material_1.Typography>
            </material_1.Box>
          </material_1.Paper>
        </framer_motion_1.motion.div>
      </material_1.Container>
    </material_1.Box>
  );
}
//# sourceMappingURL=Register.js.map
