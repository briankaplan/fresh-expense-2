import axios, { AxiosError } from "axios";

export interface Photo {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
  tags: string[];
  metadata: {
    width: number;
    height: number;
    format: string;
    takenAt?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  status: "pending" | "processed" | "error";
  error?: string;
}

export interface PhotoFilter {
  search?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  status?: Photo["status"];
  sortField?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedPhotos {
  items: Photo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class PhotoService {
  private static instance: PhotoService;
  private baseUrl = "/api/photos";

  private constructor() {}

  public static getInstance(): PhotoService {
    if (!PhotoService.instance) {
      PhotoService.instance = new PhotoService();
    }
    return PhotoService.instance;
  }

  private handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || error.message);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }

  async getPhotos(filters: PhotoFilter): Promise<PaginatedPhotos> {
    try {
      const response = await axios.get<PaginatedPhotos>(this.baseUrl, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPhoto(id: string): Promise<Photo> {
    try {
      const response = await axios.get<Photo>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadPhoto(file: File): Promise<Photo> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post<Photo>(this.baseUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updatePhoto(id: string, photo: Partial<Photo>): Promise<Photo> {
    try {
      const response = await axios.patch<Photo>(`${this.baseUrl}/${id}`, photo);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deletePhoto(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async bulkDeletePhotos(ids: string[]): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/bulk-delete`, { ids });
    } catch (error) {
      this.handleError(error);
    }
  }

  async bulkUpdatePhotos(ids: string[], updates: Partial<Photo>): Promise<Photo[]> {
    try {
      const response = await axios.patch<Photo[]>(`${this.baseUrl}/bulk-update`, {
        ids,
        updates,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async bulkAddTags(ids: string[], tags: string[]): Promise<Photo[]> {
    try {
      const response = await axios.post<Photo[]>(`${this.baseUrl}/bulk-tags`, {
        ids,
        tags,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async bulkSharePhotos(ids: string[]): Promise<{ shareUrl: string }> {
    try {
      const response = await axios.post<{ shareUrl: string }>(`${this.baseUrl}/bulk-share`, {
        ids,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async bulkDownloadPhotos(ids: string[]): Promise<Blob> {
    try {
      const response = await axios.post(
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

  async getTags(): Promise<string[]> {
    try {
      const response = await axios.get<string[]>(`${this.baseUrl}/tags`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async exportPhotos(format: "zip" | "pdf", filters?: PhotoFilter): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseUrl}/export`, {
        params: { ...filters, format },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

export default PhotoService;
