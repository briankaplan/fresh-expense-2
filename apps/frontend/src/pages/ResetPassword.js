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
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const yup_1 = require("@hookform/resolvers/yup");
const yup = __importStar(require("yup"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const react_router_dom_1 = require("react-router-dom");
const icons_material_1 = require("@mui/icons-material");
const useAuth_1 = require("@/shared/hooks/useAuth");
const react_hot_toast_1 = require("react-hot-toast");
const resetPasswordSchema = yup.object().shape({
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match'),
});
const ResetPassword = () => {
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const [showConfirmPassword, setShowConfirmPassword] = (0, react_1.useState)(false);
    const { resetPassword } = (0, useAuth_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [searchParams] = (0, react_router_dom_1.useSearchParams)();
    const theme = (0, material_1.useTheme)();
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, yup_1.yupResolver)(resetPasswordSchema),
        mode: 'onBlur',
    });
    const onSubmit = async (data) => {
        const token = searchParams.get('token');
        if (!token) {
            react_hot_toast_1.toast.error('Invalid or missing reset token');
            return;
        }
        try {
            await resetPassword(token, data.password);
            react_hot_toast_1.toast.success('Password has been reset successfully');
            navigate('/login');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to reset password. Please try again.');
        }
    };
    return (<material_1.Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme.palette.background.default,
            backgroundImage: `radial-gradient(at 50% 0%, ${theme.palette.primary.dark}29 0%, transparent 50%), 
                         radial-gradient(at 100% 0%, ${theme.palette.secondary.dark}29 0%, transparent 50%)`,
            p: 2,
        }}>
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 400 }}>
        <material_1.Card sx={{
            width: '100%',
            background: 'rgba(26, 27, 30, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}>
          <material_1.CardContent sx={{ p: 4 }}>
            <material_1.Typography variant="h4" component="h1" gutterBottom align="center" sx={{
            color: theme.palette.primary.main,
            fontWeight: 700,
            mb: 3,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        }}>
              Reset Password
            </material_1.Typography>

            <material_1.Typography variant="body1" sx={{
            mb: 4,
            textAlign: 'center',
            color: 'text.secondary',
            opacity: 0.8,
        }}>
              Please enter your new password below.
            </material_1.Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <material_1.TextField fullWidth label="New Password" type={showPassword ? 'text' : 'password'} {...register('password')} error={!!errors.password} helperText={errors.password?.message} sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
                '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
            },
        }} InputProps={{
            startAdornment: (<material_1.InputAdornment position="start">
                      <icons_material_1.Lock sx={{ color: theme.palette.primary.main }}/>
                    </material_1.InputAdornment>),
            endAdornment: (<material_1.InputAdornment position="end">
                      <material_1.IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <icons_material_1.VisibilityOff /> : <icons_material_1.Visibility />}
                      </material_1.IconButton>
                    </material_1.InputAdornment>),
        }}/>

              <material_1.TextField fullWidth label="Confirm New Password" type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
                '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
            },
        }} InputProps={{
            startAdornment: (<material_1.InputAdornment position="start">
                      <icons_material_1.Lock sx={{ color: theme.palette.primary.main }}/>
                    </material_1.InputAdornment>),
            endAdornment: (<material_1.InputAdornment position="end">
                      <material_1.IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <icons_material_1.VisibilityOff /> : <icons_material_1.Visibility />}
                      </material_1.IconButton>
                    </material_1.InputAdornment>),
        }}/>

              <material_1.Button fullWidth type="submit" variant="contained" disabled={isSubmitting} sx={{
            py: 1.5,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            },
            '&:disabled': {
                background: theme.palette.action.disabledBackground,
            },
        }}>
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </material_1.Button>
            </form>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.default = ResetPassword;
//# sourceMappingURL=ResetPassword.js.map