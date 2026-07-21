import { run } from "./build.js";
import { projectPath } from "./paths.js";
export class Executor {
    chat;
    constructor(chat) {
        this.chat = chat;
    }
    async execute(task) {
        console.log("");
        console.log("Task");
        console.log(task);
        console.log("");
        const answer = await this.chat.send(task);
        console.log(answer);
        console.log("");
        return answer;
    }
    async buildFrontend() {
        return run("npm", ["run", "build"], projectPath("frontend"));
    }
    async buildBackend() {
        return run("python", ["-m", "pytest"], projectPath("backend"));
    }
}
