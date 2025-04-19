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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Login;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const AuthContext_1 = require("@/context/AuthContext");
const framer_motion_1 = require("framer-motion");
function Login() {
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const { login } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const location = (0, react_router_dom_1.useLocation)();
    const from = location.state?.from?.pathname || '/dashboard';
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate(from, { replace: true });
        }
        catch (err) {
            setError('Invalid email or password');
        }
    };
    return (<material_1.Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
      <material_1.Container maxWidth="sm">
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <material_1.Paper elevation={24} sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
        }}>
            <material_1.Typography component="h1" variant="h4" sx={{
            mb: 3,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        }}>
              Welcome Back
            </material_1.Typography>

            {error && (<material_1.Fade in={!!error}>
                <material_1.Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {error}
                </material_1.Alert>
              </material_1.Fade>)}

            <material_1.Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <material_1.TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} InputProps={{
            startAdornment: (<material_1.InputAdornment position="start">
                      <icons_material_1.Email color="primary"/>
                    </material_1.InputAdornment>),
        }} sx={{ mb: 2 }}/>

              <material_1.TextField margin="normal" required fullWidth name="password" label="Password" type={showPassword ? 'text' : 'password'} id="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} InputProps={{
            startAdornment: (<material_1.InputAdornment position="start">
                      <icons_material_1.Lock color="primary"/>
                    </material_1.InputAdornment>),
            endAdornment: (<material_1.InputAdornment position="end">
                      <material_1.IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <icons_material_1.VisibilityOff /> : <icons_material_1.Visibility />}
                      </material_1.IconButton>
                    </material_1.InputAdornment>),
        }} sx={{ mb: 2 }}/>

              <material_1.Button type="submit" fullWidth variant="contained" sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            '&:hover': {
                background: 'linear-gradient(45deg, #764ba2, #667eea)',
            },
        }}>
                Sign In
              </material_1.Button>

              <material_1.Box sx={{ textAlign: 'center' }}>
                <react_router_dom_1.Link to="/forgot-password" style={{
            textDecoration: 'none',
            color: '#667eea',
            fontSize: '0.875rem',
        }}>
                  Forgot password?
                </react_router_dom_1.Link>
                <material_1.Typography variant="body2" sx={{ mt: 2 }}>
                  Don't have an account?{' '}
                  <react_router_dom_1.Link to="/register" style={{
            textDecoration: 'none',
            color: '#667eea',
            fontWeight: 'bold',
        }}>
                    Sign up
                  </react_router_dom_1.Link>
                </material_1.Typography>
              </material_1.Box>
            </material_1.Box>
          </material_1.Paper>
        </framer_motion_1.motion.div>
      </material_1.Container>
    </material_1.Box>);
}
//# sourceMappingURL=Login.js.map