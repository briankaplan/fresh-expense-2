import axios from "axios";
import type { ExpenseFilter } from "./expense.service";

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: ExpenseFilter;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

class FilterPresetService {
  private static instance: FilterPresetService;
  private baseUrl = "/api/filter-presets";

  private constructor() {}

  public static getInstance(): FilterPresetService {
    if (!FilterPresetService.instance) {
      FilterPresetService.instance = new FilterPresetService();
    }
    return FilterPresetService.instance;
  }

  async getPresets(): Promise<FilterPreset[]> {
    const response = await axios.get<FilterPreset[]>(this.baseUrl);
    return response.data;
  }

  async createPreset(
    preset: Omit<FilterPreset, "id" | "createdAt" | "updatedAt">,
  ): Promise<FilterPreset> {
    const response = await axios.post<FilterPreset>(this.baseUrl, preset);
    return response.data;
  }

  async updatePreset(id: string, preset: Partial<FilterPreset>): Promise<FilterPreset> {
    const response = await axios.patch<FilterPreset>(`${this.baseUrl}/${id}`, preset);
    return response.data;
  }

  async deletePreset(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  async setDefaultPreset(id: string): Promise<void> {
    await axios.post(`${this.baseUrl}/${id}/set-default`);
  }
}

export default FilterPresetService;
