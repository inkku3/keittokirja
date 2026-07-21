import fs from "node:fs/promises";
import { projectPath } from "./paths.js";

export interface RepositoryInfo {
    frontend: boolean;
    backend: boolean;
    legacy: boolean;
    packageJson: boolean;
}

export async function inspectRepository(): Promise<RepositoryInfo> {

    async function exists(name: string) {
        try {
            await fs.access(projectPath(name));
            return true;
        }
        catch {
            return false;
        }
    }

    return {
        frontend: await exists("frontend"),
        backend: await exists("backend"),
        legacy: await exists("legacy"),
        packageJson: await exists("package.json")
    };

}
