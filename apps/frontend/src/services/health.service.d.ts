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
declare class HealthService {
  private static instance;
  private checkInterval;
  private intervalId?;
  private constructor();
  static getInstance(): HealthService;
  checkHealth(): Promise<HealthStatus>;
  startHealthCheck(): void;
  stopHealthCheck(): void;
  private performHealthCheck;
}
export declare const healthService: HealthService;
export default healthService;
//# sourceMappingURL=health.service.d.ts.map
