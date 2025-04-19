const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class FilterPresetService {
  static instance;
  baseUrl = "/api/filter-presets";
  static getInstance() {
    if (!FilterPresetService.instance) {
      FilterPresetService.instance = new FilterPresetService();
    }
    return FilterPresetService.instance;
  }
  async getPresets() {
    const response = await axios_1.default.get(this.baseUrl);
    return response.data;
  }
  async createPreset(preset) {
    const response = await axios_1.default.post(this.baseUrl, preset);
    return response.data;
  }
  async updatePreset(id, preset) {
    const response = await axios_1.default.patch(`${this.baseUrl}/${id}`, preset);
    return response.data;
  }
  async deletePreset(id) {
    await axios_1.default.delete(`${this.baseUrl}/${id}`);
  }
  async setDefaultPreset(id) {
    await axios_1.default.post(`${this.baseUrl}/${id}/set-default`);
  }
}
exports.default = FilterPresetService;
//# sourceMappingURL=filter-preset.service.js.map
