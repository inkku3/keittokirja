import path from "node:path";

/**
 * The agent lives in its own folder (e.g. /agent) alongside the project
 * it's migrating: /frontend, /backend, /legacy are siblings, not children.
 * PROJECT_ROOT is that parent directory - the place all of those actually
 * live. It can be overridden with an env var if the agent is ever run from
 * somewhere other than its own folder.
 */
export const PROJECT_ROOT =
    process.env.PROJECT_ROOT
    ? path.resolve(process.env.PROJECT_ROOT)
    : path.resolve(process.cwd(), "..");

export function projectPath(...segments: string[]): string {
    return path.join(PROJECT_ROOT, ...segments);
}
