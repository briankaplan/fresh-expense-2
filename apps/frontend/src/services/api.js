const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const react_hot_toast_1 = require("react-hot-toast");
const env_validation_1 = require("../utils/env-validation");
class ApiClient {
  static instance;
  axiosInstance;
  cache;
  CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  constructor() {
    // Validate environment variables
    (0, env_validation_1.validateEnvironment)();
    this.axiosInstance = axios_1.default.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
      headers: {
        "Content-Type": "application/json",
        "X-Application-Id": import.meta.env.VITE_TELLER_APPLICATION_ID,
        "X-Environment": import.meta.env.VITE_TELLER_ENVIRONMENT,
      },
    });
    this.cache = new Map();
    this.setupInterceptors();
  }
  static getInstance() {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
  setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Add Teller-specific headers for Teller API endpoints
        if (config.url?.includes("/teller/")) {
          config.headers["X-Application-Id"] = import.meta.env.VITE_TELLER_APPLICATION_ID;
          config.headers["X-Environment"] = import.meta.env.VITE_TELLER_ENVIRONMENT;
        }
        if (import.meta.env.DEV) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }
        return config;
      },
      (error) => {
        if (import.meta.env.DEV) {
          console.error("[API Request Error]", error);
        }
        return Promise.reject(error);
      },
    );
    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (import.meta.env.DEV) {
          console.log(
            `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
            response.data,
          );
        }
        return response;
      },
      async (error) => {
        if (import.meta.env.DEV) {
          console.error("[API Error]", error.response?.data || error.message);
        }
        if (error.response) {
          const { status, data } = error.response;
          switch (status) {
            case 401:
              react_hot_toast_1.toast.error("Session expired. Please log in again.");
              localStorage.removeItem(import.meta.env.VITE_JWT_STORAGE_KEY);
              window.location.href = "/login";
              break;
            case 403:
              react_hot_toast_1.toast.error("You do not have permission to perform this action");
              break;
            case 404:
              react_hot_toast_1.toast.error("Resource not found");
              break;
            case 422:
              react_hot_toast_1.toast.error(data?.details?.message || "Invalid data provided");
              break;
            case 429:
              react_hot_toast_1.toast.error("Too many requests. Please try again later.");
              break;
            case 500:
              react_hot_toast_1.toast.error(
                "An unexpected error occurred. Please try again later.",
              );
              break;
            default:
              react_hot_toast_1.toast.error(data?.message || "Something went wrong");
          }
        } else if (error.request) {
          react_hot_toast_1.toast.error(
            "Unable to connect to the server. Please check your internet connection.",
          );
        } else {
          react_hot_toast_1.toast.error("An error occurred while processing your request");
        }
        return Promise.reject(error);
      },
    );
  }
  getCacheKey(url, config) {
    return `${url}-${JSON.stringify(config)}`;
  }
  isCacheValid(entry) {
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }
  async get(url, config) {
    const cacheKey = this.getCacheKey(url, config);
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      if (import.meta.env.DEV) {
        console.log(`[Cache Hit] ${url}`);
      }
      return cached.data;
    }
    const response = await this.axiosInstance.get(url, config);
    this.cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });
    return response.data;
  }
  async post(url, data, config) {
    const response = await this.axiosInstance.post(url, data, config);
    // Invalidate cache for related GET requests
    this.cache.clear();
    return response.data;
  }
  async put(url, data, config) {
    const response = await this.axiosInstance.put(url, data, config);
    // Invalidate cache for related GET requests
    this.cache.clear();
    return response.data;
  }
  async delete(url, config) {
    const response = await this.axiosInstance.delete(url, config);
    // Invalidate cache for related GET requests
    this.cache.clear();
    return response.data;
  }
  async patch(url, data, config) {
    const response = await this.axiosInstance.patch(url, data, config);
    // Invalidate cache for related GET requests
    this.cache.clear();
    return response.data;
  }
  clearCache() {
    this.cache.clear();
  }
}
exports.apiClient = ApiClient.getInstance();
exports.default = exports.apiClient;
//# sourceMappingURL=api.js.map
