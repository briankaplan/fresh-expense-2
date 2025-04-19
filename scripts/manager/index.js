"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectManager = exports.ProjectManager = void 0;
const mongodb_1 = require("mongodb");
const rest_1 = require("@octokit/rest");
const child_process_1 = require("child_process");
const util_1 = require("util");
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ProjectManager {
    mongoClient = null;
    octokit = null;
    config;
    constructor(config) {
        this.config = config;
        this.initializeClients();
    }
    initializeClients() {
        if (process.env.MONGODB_URI) {
            this.mongoClient = new mongodb_1.MongoClient(process.env.MONGODB_URI);
        }
        if (process.env.GITHUB_TOKEN) {
            this.octokit = new rest_1.Octokit({ auth: process.env.GITHUB_TOKEN });
        }
    }
    async manageDatabase() {
        if (!this.mongoClient) {
            throw new Error('MongoDB client not initialized');
        }
        try {
            await this.mongoClient.connect();
            const db = this.mongoClient.db(this.config.database.name);
            // Create indexes
            for (const collection of this.config.database.collections) {
                await db
                    .collection(collection)
                    .createIndexes([{ key: { createdAt: 1 } }, { key: { updatedAt: 1 } }]);
            }
            // Check database health
            const stats = await db.stats();
            console.log(chalk_1.default.green('Database health check passed'));
            console.log(chalk_1.default.blue(`Database size: ${stats.dataSize} bytes`));
            console.log(chalk_1.default.blue(`Collections: ${stats.collections}`));
        }
        finally {
            await this.mongoClient.close();
        }
    }
    async manageEnvironment() {
        const envContent = Object.entries(this.config.environment.variables)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
        await fs_extra_1.default.writeFile('.env', envContent);
        console.log(chalk_1.default.green('Environment file generated'));
    }
    async manageSecrets() {
        if (!this.octokit) {
            throw new Error('Octokit client not initialized');
        }
        const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || [];
        if (!owner || !repo) {
            throw new Error('GITHUB_REPOSITORY environment variable not set');
        }
        // Get the public key for encryption
        const { data: { key_id, key }, } = await this.octokit.actions.getRepoPublicKey({
            owner,
            repo,
        });
        for (const [secretName, value] of Object.entries(this.config.environment.variables)) {
            if (value.startsWith('secret:')) {
                const secretValue = value.replace('secret:', '');
                await this.octokit.actions.createOrUpdateRepoSecret({
                    owner,
                    repo,
                    secret_name: secretName,
                    encrypted_value: secretValue,
                    key_id,
                });
            }
        }
    }
    async manageDeployment() {
        // Start Docker services
        for (const service of this.config.deployment.services) {
            await execAsync(`docker-compose up -d ${service}`);
        }
        // Run health checks
        for (const check of this.config.deployment.healthChecks) {
            const { stdout } = await execAsync(check);
            if (!stdout.includes('OK')) {
                throw new Error(`Health check failed: ${check}`);
            }
        }
        console.log(chalk_1.default.green('Deployment completed successfully'));
    }
}
exports.ProjectManager = ProjectManager;
// Export a singleton instance
exports.projectManager = new ProjectManager({
    database: {
        url: '',
        name: '',
        collections: [],
    },
    environment: {
        name: '',
        variables: {},
    },
    deployment: {
        services: [],
        healthChecks: [],
    },
});
//# sourceMappingURL=index.js.map