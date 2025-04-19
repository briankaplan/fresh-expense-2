interface Config {
    database: {
        url: string;
        name: string;
        collections: string[];
    };
    environment: {
        name: string;
        variables: Record<string, string>;
    };
    deployment: {
        services: string[];
        healthChecks: string[];
    };
}
export declare class ProjectManager {
    private mongoClient;
    private octokit;
    private config;
    constructor(config: Config);
    private initializeClients;
    manageDatabase(): Promise<void>;
    manageEnvironment(): Promise<void>;
    manageSecrets(): Promise<void>;
    manageDeployment(): Promise<void>;
}
export declare const projectManager: ProjectManager;
export {};
//# sourceMappingURL=index.d.ts.map