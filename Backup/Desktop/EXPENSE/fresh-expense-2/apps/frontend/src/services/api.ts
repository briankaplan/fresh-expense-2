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

class ApiClient {
	private static instance: ApiClient;
	private axiosInstance: AxiosInstance;

	private constructor() {
		this.axiosInstance = axios.create({
			baseURL: import.meta.env.VITE_API_URL,
			timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
			headers: {
				'Content-Type': 'application/json',
			},
		});

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
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		// Response interceptor
		this.axiosInstance.interceptors.response.use(
			(response) => {
				return response;
			},
			async (error: AxiosError<ApiError>) => {
				const setIsLoading = useUIStore.getState().setIsLoading;
				setIsLoading(false);

				if (error.response) {
					const { status, data } = error.response;

					switch (status) {
						case 401:
							// Handle unauthorized
							toast.error('Session expired. Please log in again.');
							// Redirect to login or refresh token
							break;
						case 403:
							toast.error('You do not have permission to perform this action');
							break;
						case 404:
							toast.error('Resource not found');
							break;
						case 422:
							toast.error('Invalid data provided');
							break;
						case 500:
							toast.error('An unexpected error occurred. Please try again later.');
							break;
						default:
							toast.error(data?.message || 'Something went wrong');
					}
				} else if (error.request) {
					toast.error('Unable to connect to the server');
				} else {
					toast.error('An error occurred while processing your request');
				}

				return Promise.reject(error);
			}
		);
	}

	public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
		const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
		return response.data;
	}

	public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
		const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
		return response.data;
	}

	public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
		const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
		return response.data;
	}

	public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
		const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
		return response.data;
	}

	public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
		const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
		return response.data;
	}
}

export const apiClient = ApiClient.getInstance();
export default apiClient;