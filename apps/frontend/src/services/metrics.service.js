var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsService = void 0;
const axios_1 = __importDefault(require("axios"));
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
class MetricsService {
  baseUrl = `${API_URL}/metrics`;
  async findAll(params) {
    const response = await axios_1.default.get(this.baseUrl, { params });
    return response.data;
  }
  async findByType(type, params) {
    const response = await axios_1.default.get(`${this.baseUrl}/type/${type}`, {
      params,
    });
    return response.data;
  }
  async findOne(id) {
    const response = await axios_1.default.get(`${this.baseUrl}/${id}`);
    return response.data;
  }
  async create(metric) {
    const response = await axios_1.default.post(this.baseUrl, metric);
    return response.data;
  }
  async update(id, metric) {
    const response = await axios_1.default.put(`${this.baseUrl}/${id}`, metric);
    return response.data;
  }
  async delete(id) {
    await axios_1.default.delete(`${this.baseUrl}/${id}`);
  }
  async aggregateMetrics(params) {
    const response = await axios_1.default.get(`${this.baseUrl}/aggregate`, {
      params,
    });
    return response.data;
  }
}
exports.metricsService = new MetricsService();
//# sourceMappingURL=metrics.service.js.map
