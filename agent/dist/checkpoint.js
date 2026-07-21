import fs from "node:fs/promises";
const FILE = ".agent-state.json";
export async function save(state) {
    await fs.writeFile(FILE, JSON.stringify(state, null, 2));
}
export async function load() {
    try {
        return JSON.parse(await fs.readFile(FILE, "utf8"));
    }
    catch {
        return null;
    }
}
export async function remove() {
    try {
        await fs.unlink(FILE);
    }
    catch {
        // nothing to remove
    }
}
