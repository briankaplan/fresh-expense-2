import { AxiosRequestConfig } from 'axios';
export interface ApiError {
    message: string;
    code: string;
    status: number;
    details?: Record<string, any>;
}
export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
}
declare class ApiClient {
    private static instance;
    private axiosInstance;
    private cache;
    private readonly CACHE_TTL;
    private constructor();
    static getInstance(): ApiClient;
    private setupInterceptors;
    private getCacheKey;
    private isCacheValid;
    get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    clearCache(): void;
}
export declare const apiClient: ApiClient;
export default apiClient;
//# sourceMappingURL=api.d.ts.map