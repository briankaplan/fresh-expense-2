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
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const auth_1 = require("@/core/api/auth");
const VerifyEmail = () => {
    const [searchParams] = (0, react_router_dom_1.useSearchParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [status, setStatus] = (0, react_1.useState)('verifying');
    const [message, setMessage] = (0, react_1.useState)('Verifying your email...');
    (0, react_1.useEffect)(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }
        const verify = async () => {
            try {
                await (0, auth_1.verifyEmail)(token);
                setStatus('success');
                setMessage('Email verified successfully! You can now log in.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
            catch (error) {
                setStatus('error');
                setMessage('Failed to verify email. The link may be expired or invalid.');
            }
        };
        verify();
    }, [searchParams, navigate]);
    return (<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <div className="mt-4">
            <div className={`text-center p-4 rounded-md ${status === 'verifying'
            ? 'bg-blue-100 text-blue-700'
            : status === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
            {status === 'error' && (<div className="mt-4 text-center">
                <button onClick={() => navigate('/login')} className="text-indigo-600 hover:text-indigo-500">
                  Return to Login
                </button>
              </div>)}
          </div>
        </div>
      </div>
    </div>);
};
exports.default = VerifyEmail;
//# sourceMappingURL=VerifyEmail.js.map