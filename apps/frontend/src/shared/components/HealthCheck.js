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
var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const health_service_1 = __importDefault(require("../services/health.service"));
const HealthCheck = () => {
  const [health, setHealth] = (0, react_1.useState)(null);
  const [loading, setLoading] = (0, react_1.useState)(false);
  const checkHealth = async () => {
    setLoading(true);
    try {
      const status = await health_service_1.default.checkHealth();
      setHealth(status);
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setLoading(false);
    }
  };
  (0, react_1.useEffect)(() => {
    checkHealth();
    health_service_1.default.startHealthCheck();
    return () => {
      health_service_1.default.stopHealthCheck();
    };
  }, []);
  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "success";
      case "degraded":
        return "warning";
      case "unhealthy":
        return "error";
      default:
        return "default";
    }
  };
  if (!health) {
    return null;
  }
  return (
    <material_1.Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
      <material_1.Tooltip title="System Status">
        <material_1.Chip
          label={health.status.toUpperCase()}
          color={getStatusColor(health.status)}
          size="small"
        />
      </material_1.Tooltip>

      <material_1.Typography variant="caption" color="textSecondary">
        v{health.version}
      </material_1.Typography>

      <material_1.Box sx={{ display: "flex", gap: 1 }}>
        {Object.entries(health.services).map(([service, status]) => (
          <material_1.Tooltip key={service} title={`${service}: ${status ? "Online" : "Offline"}`}>
            <material_1.Chip
              label={service}
              size="small"
              color={status ? "success" : "error"}
              variant="outlined"
            />
          </material_1.Tooltip>
        ))}
      </material_1.Box>

      <material_1.Tooltip title="Refresh Status">
        <material_1.IconButton
          size="small"
          onClick={checkHealth}
          disabled={loading}
          sx={{ ml: "auto" }}
        >
          <icons_material_1.Refresh />
        </material_1.IconButton>
      </material_1.Tooltip>
    </material_1.Box>
  );
};
exports.default = HealthCheck;
//# sourceMappingURL=HealthCheck.js.map
