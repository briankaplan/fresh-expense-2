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
declare class PhotoService {
  private static instance;
  private baseUrl;
  private constructor();
  static getInstance(): PhotoService;
  private handleError;
  getPhotos(filters: PhotoFilter): Promise<PaginatedPhotos>;
  getPhoto(id: string): Promise<Photo>;
  uploadPhoto(file: File): Promise<Photo>;
  updatePhoto(id: string, photo: Partial<Photo>): Promise<Photo>;
  deletePhoto(id: string): Promise<void>;
  bulkDeletePhotos(ids: string[]): Promise<void>;
  bulkUpdatePhotos(ids: string[], updates: Partial<Photo>): Promise<Photo[]>;
  bulkAddTags(ids: string[], tags: string[]): Promise<Photo[]>;
  bulkSharePhotos(ids: string[]): Promise<{
    shareUrl: string;
  }>;
  bulkDownloadPhotos(ids: string[]): Promise<Blob>;
  getTags(): Promise<string[]>;
  exportPhotos(format: "zip" | "pdf", filters?: PhotoFilter): Promise<Blob>;
}
export default PhotoService;
//# sourceMappingURL=photo.service.d.ts.map
