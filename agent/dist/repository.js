import fs from "node:fs/promises";
import { projectPath } from "./paths.js";
export async function inspectRepository() {
    async function exists(name) {
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
