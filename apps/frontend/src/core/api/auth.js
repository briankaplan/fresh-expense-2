const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken =
  exports.changePassword =
  exports.resetPassword =
  exports.forgotPassword =
  exports.verifyEmail =
  exports.register =
  exports.login =
    void 0;
const axios_1 = __importDefault(require("axios"));
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const login = async (credentials) => {
  const response = await axios_1.default.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};
exports.login = login;
const register = async (data) => {
  const response = await axios_1.default.post(`${API_URL}/auth/register`, data);
  return response.data;
};
exports.register = register;
const verifyEmail = async (token) => {
  const response = await axios_1.default.get(`${API_URL}/auth/verify-email/${token}`);
  return response.data;
};
exports.verifyEmail = verifyEmail;
const forgotPassword = async (email) => {
  const response = await axios_1.default.post(`${API_URL}/auth/forgot-password`, { email });
  return response.data;
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (token, newPassword) => {
  const response = await axios_1.default.post(`${API_URL}/auth/reset-password/${token}`, {
    newPassword,
  });
  return response.data;
};
exports.resetPassword = resetPassword;
const changePassword = async (data) => {
  const response = await axios_1.default.put(`${API_URL}/auth/change-password`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};
exports.changePassword = changePassword;
const refreshToken = async (refreshToken) => {
  const response = await axios_1.default.post(`${API_URL}/auth/refresh-token`, {
    refreshToken,
  });
  return response.data;
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=auth.js.map
