import { exec } from "child_process";
import path from "path";
import { promisify } from "util";
import { Octokit } from "@octokit/rest";
import chalk from "chalk";
import dotenv from "dotenv";
import fs from "fs-extra";
import { MongoClient } from "mongodb";
import { DatabaseConfig, DeploymentConfig, EnvironmentConfig, Secret } from "./types";

const execAsync = promisify(exec);

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

export class ProjectManager {
  private mongoClient: MongoClient | null = null;
  private octokit: Octokit | null = null;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.initializeClients();
  }

  private initializeClients() {
    if (process.env.MONGODB_URI) {
      this.mongoClient = new MongoClient(process.env.MONGODB_URI);
    }
    if (process.env.GITHUB_TOKEN) {
      this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    }
  }

  async manageDatabase() {
    if (!this.mongoClient) {
      throw new Error("MongoDB client not initialized");
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
      console.log(chalk.green("Database health check passed"));
      console.log(chalk.blue(`Database size: ${stats.dataSize} bytes`));
      console.log(chalk.blue(`Collections: ${stats.collections}`));
    } finally {
      await this.mongoClient.close();
    }
  }

  async manageEnvironment() {
    const envContent = Object.entries(this.config.environment.variables)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    await fs.writeFile(".env", envContent);
    console.log(chalk.green("Environment file generated"));
  }

  async manageSecrets() {
    if (!this.octokit) {
      throw new Error("Octokit client not initialized");
    }

    const [owner, repo] = process.env.GITHUB_REPOSITORY?.split("/") || [];
    if (!owner || !repo) {
      throw new Error("GITHUB_REPOSITORY environment variable not set");
    }

    // Get the public key for encryption
    const {
      data: { key_id, key },
    } = await this.octokit.actions.getRepoPublicKey({
      owner,
      repo,
    });

    for (const [secretName, value] of Object.entries(this.config.environment.variables)) {
      if (value.startsWith("secret:")) {
        const secretValue = value.replace("secret:", "");
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
      if (!stdout.includes("OK")) {
        throw new Error(`Health check failed: ${check}`);
      }
    }

    console.log(chalk.green("Deployment completed successfully"));
  }
}

// Export a singleton instance
export const projectManager = new ProjectManager({
  database: {
    url: "",
    name: "",
    collections: [],
  },
  environment: {
    name: "",
    variables: {},
  },
  deployment: {
    services: [],
    healthChecks: [],
  },
});
