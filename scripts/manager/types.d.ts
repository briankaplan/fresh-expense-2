export interface DatabaseConfig {
    name: string;
    username: string;
    password: string;
    uri: string;
    indexes: {
        collection: string;
        fields: Record<string, number>;
        options?: Record<string, any>;
    }[];
}
export interface EnvironmentConfig {
    name: 'development' | 'test' | 'production';
    port: number;
    host: string;
    database: DatabaseConfig;
    jwt: {
        secret: string;
        issuer: string;
        audience: string;
        accessExpiration: string;
        refreshExpiration: string;
    };
    encryption: {
        key: string;
        iv: string;
    };
    cors: {
        origin: string;
        methods: string[];
        credentials: boolean;
    };
    cloudflare?: {
        apiToken: string;
        accountId: string;
        zoneId: string;
        r2: {
            accountId: string;
            accessKeyId: string;
            secretAccessKey: string;
            bucketName: string;
            publicUrl: string;
        };
    };
    teller?: {
        applicationId: string;
        apiUrl: string;
        apiVersion: string;
        environment: string;
        signingSecret: string;
        signingKey: string;
    };
}
export interface Secret {
    name: string;
    value: string;
    environment: 'development' | 'test' | 'production';
    description: string;
    isSensitive: boolean;
}
export interface DeploymentConfig {
    environment: 'development' | 'test' | 'production';
    docker: {
        composeFile: string;
        services: string[];
    };
    monitoring: {
        prometheus: boolean;
        grafana: boolean;
        nodeExporter: boolean;
        cadvisor: boolean;
    };
    healthChecks: {
        backend: string;
        frontend: string;
    };
}
//# sourceMappingURL=types.d.ts.map