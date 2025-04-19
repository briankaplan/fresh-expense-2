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
exports.useMetrics = exports.MetricsProvider = void 0;
const react_1 = __importStar(require("react"));
const metrics_service_1 = require("../services/metrics.service");
const MetricsContext = (0, react_1.createContext)(undefined);
const MetricsProvider = ({ children }) => {
  const [metrics, setMetrics] = (0, react_1.useState)([]);
  const [aggregatedData, setAggregatedData] = (0, react_1.useState)(null);
  const [loading, setLoading] = (0, react_1.useState)(false);
  const [error, setError] = (0, react_1.useState)(null);
  const fetchMetrics = (0, react_1.useCallback)(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const data = await metrics_service_1.metricsService.findAll(params);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchAggregatedMetrics = (0, react_1.useCallback)(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const data = await metrics_service_1.metricsService.aggregateMetrics(params);
      setAggregatedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch aggregated metrics");
    } finally {
      setLoading(false);
    }
  }, []);
  const createMetric = (0, react_1.useCallback)(async (metric) => {
    try {
      setLoading(true);
      setError(null);
      const newMetric = await metrics_service_1.metricsService.create(metric);
      setMetrics((prev) => [...prev, newMetric]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create metric");
    } finally {
      setLoading(false);
    }
  }, []);
  const updateMetric = (0, react_1.useCallback)(async (id, metric) => {
    try {
      setLoading(true);
      setError(null);
      const updatedMetric = await metrics_service_1.metricsService.update(id, metric);
      setMetrics((prev) => prev.map((m) => (m._id === id ? updatedMetric : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update metric");
    } finally {
      setLoading(false);
    }
  }, []);
  const deleteMetric = (0, react_1.useCallback)(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await metrics_service_1.metricsService.delete(id);
      setMetrics((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete metric");
    } finally {
      setLoading(false);
    }
  }, []);
  const value = {
    metrics,
    aggregatedData,
    loading,
    error,
    fetchMetrics,
    fetchAggregatedMetrics,
    createMetric,
    updateMetric,
    deleteMetric,
  };
  return <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>;
};
exports.MetricsProvider = MetricsProvider;
const useMetrics = () => {
  const context = (0, react_1.useContext)(MetricsContext);
  if (context === undefined) {
    throw new Error("useMetrics must be used within a MetricsProvider");
  }
  return context;
};
exports.useMetrics = useMetrics;
//# sourceMappingURL=MetricsContext.js.map
