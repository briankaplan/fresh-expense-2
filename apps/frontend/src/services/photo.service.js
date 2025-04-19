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
const axios_1 = __importStar(require("axios"));
class PhotoService {
  static instance;
  baseUrl = "/api/photos";
  static getInstance() {
    if (!PhotoService.instance) {
      PhotoService.instance = new PhotoService();
    }
    return PhotoService.instance;
  }
  handleError(error) {
    if (error instanceof axios_1.AxiosError) {
      throw new Error(error.response?.data?.message || error.message);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
  async getPhotos(filters) {
    try {
      const response = await axios_1.default.get(this.baseUrl, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  async getPhoto(id) {
    try {
      const response = await axios_1.default.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  async uploadPhoto(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios_1.default.post(this.baseUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  async updatePhoto(id, photo) {
    try {
      const response = await axios_1.default.patch(`${this.baseUrl}/${id}`, photo);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  async deletePhoto(id) {
    try {
      await axios_1.default.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }
  async bulkDeletePhotos(ids) {
    try {
      await axios_1.default.post(`${this.baseUrl}/bulk-delete`, { ids });
    } catch (error) {
      this.handleError(error);
    }
  }
  async bulkUpdatePhotos(ids, updates) {
    try {
      const response = await axios_1.default.patch(`${this.baseUrl}/bulk-update`, {
        ids,
        updates,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  async bulkAddTags(ids, tags) {
    try {
      const response = await axios_1.default.post(`${this.baseUrl}/bulk-tags`, {
        ids,
        tags,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  async bulkSharePhotos(ids) {
    try {
      const response = await axios_1.default.post(`${this.baseUrl}/bulk-share`, {
        ids,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  async bulkDownloadPhotos(ids) {
    try {
      const response = await axios_1.default.post(
        `${this.baseUrl}/bulk-download`,
        { ids },
        {
          responseType: "blob",
        },
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  async getTags() {
    try {
      const response = await axios_1.default.get(`${this.baseUrl}/tags`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  async exportPhotos(format, filters) {
    try {
      const response = await axios_1.default.get(`${this.baseUrl}/export`, {
        params: { ...filters, format },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}
exports.default = PhotoService;
//# sourceMappingURL=photo.service.js.map
