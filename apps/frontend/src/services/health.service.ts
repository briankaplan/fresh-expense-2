import { toast } from "react-hot-toast";
import api from "./api";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  services: {
    database: boolean;
    api: boolean;
    cache: boolean;
  };
  version: string;
  uptime: number;
}

class HealthService {
  private static instance: HealthService;
  private checkInterval = 30000; // 30 seconds
  private intervalId?: ReturnType<typeof setInterval>;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  public async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await api.get<HealthStatus>("/api/health");
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }

  public startHealthCheck() {
    // Clear any existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Perform initial check
    this.performHealthCheck();

    // Set up interval for subsequent checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);
  }

  public stopHealthCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async performHealthCheck() {
    try {
      const health = await this.checkHealth();

      if (health.status !== "healthy") {
        toast.error("Some services are currently degraded");
        console.warn("Health check warning:", health);
      }
    } catch (error) {
      toast.error("Unable to connect to the server");
      console.error("Health check error:", error);
    }
  }
}

export const healthService = HealthService.getInstance();
export default healthService;
