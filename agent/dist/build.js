import { spawn } from "node:child_process";
export function run(command, args, cwd) {
    return new Promise(resolve => {
        const proc = spawn(command, args, {
            cwd,
            shell: true
        });
        let output = "";
        proc.stdout.on("data", d => {
            output += d.toString();
        });
        proc.stderr.on("data", d => {
            output += d.toString();
        });
        proc.on("error", err => {
            output += String(err);
            resolve({ success: false, output });
        });
        proc.on("close", code => {
            resolve({
                success: code === 0,
                output
            });
        });
    });
}
