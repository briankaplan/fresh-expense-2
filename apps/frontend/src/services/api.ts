import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';
import { useUIStore } from '../store';

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

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

class ApiClient {
	private static instance: ApiClient;
	private axiosInstance: AxiosInstance;
	private cache: Map<string, CacheEntry<any>>;
	private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	private constructor() {
		this.axiosInstance = axios.create({
			baseURL: import.meta.env.VITE_API_URL,
			timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
			headers: {
				'Content-Type': 'application/json',
			},
		});
		this.cache = new Map();
		this.setupInterceptors();
	}

	public static getInstance(): ApiClient {
		if (!ApiClient.instance) {
			ApiClient.instance = new ApiClient();
		}
		return ApiClient.instance;
	}

	private setupInterceptors() {
		// Request interceptor
		this.axiosInstance.interceptors.request.use(
			(config) => {
				const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY);
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				if (import.meta.env.DEV) {
					console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
				}
				return config;
			},
			(error) => {
				if (import.meta.env.DEV) {
					console.error('[API Request Error]', error);
				}
				return Promise.reject(error);
			}
		);

		// Response interceptor
		this.axiosInstance.interceptors.response.use(
			(response) => {
				if (import.meta.env.DEV) {
					console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
				}
				return response;
			},
			async (error: AxiosError<ApiError>) => {
				const setIsLoading = useUIStore.getState().setIsLoading;
				setIsLoading(false);

				if (import.meta.env.DEV) {
					console.error('[API Error]', error.response?.data || error.message);
				}

				if (error.response) {
					const { status, data } = error.response;

					switch (status) {
						case 401:
							toast.error('Session expired. Please log in again.');
							localStorage.removeItem(import.meta.env.VITE_JWT_STORAGE_KEY);
							window.location.href = '/login';
							break;
						case 403:
							toast.error('You do not have permission to perform this action');
							break;
						case 404:
							toast.error('Resource not found');
							break;
						case 422:
							toast.error(data?.details?.message || 'Invalid data provided');
							break;
						case 429:
							toast.error('Too many requests. Please try again later.');
							break;
						case 500:
							toast.error('An unexpected error occurred. Please try again later.');
							break;
						default:
							toast.error(data?.message || 'Something went wrong');
					}
				} else if (error.request) {
					toast.error('Unable to connect to the server. Please check your internet connection.');
				} else {
					toast.error('An error occurred while processing your request');
				}

				return Promise.reject(error);
			}
		);
	}

	private getCacheKey(url: string, config?: AxiosRequestConfig): string {
		return `${url}-${JSON.stringify(config)}`;
	}

	private isCacheValid(entry: CacheEntry<any>): boolean {
		return Date.now() - entry.timestamp < this.CACHE_TTL;
	}

	public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
		const cacheKey = this.getCacheKey(url, config);
		const cached = this.cache.get(cacheKey);

		if (cached && this.isCacheValid(cached)) {
			if (import.meta.env.DEV) {
				console.log(`[Cache Hit] ${url}`);
			}
			return cached.data;
		}

		const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
		this.cache.set(cacheKey, {
			data: response.data,
			timestamp: Date.now(),
		});
		return response.data;
	}

	public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
		const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
		// Invalidate cache for related GET requests
		this.cache.clear();
		return response.data;
	}

	public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
		const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
		// Invalidate cache for related GET requests
		this.cache.clear();
		return response.data;
	}

	public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
		const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
		// Invalidate cache for related GET requests
		this.cache.clear();
		return response.data;
	}

	public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
		const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
		// Invalidate cache for related GET requests
		this.cache.clear();
		return response.data;
	}

	public clearCache(): void {
		this.cache.clear();
	}
}

export const apiClient = ApiClient.getInstance();
export default apiClient;