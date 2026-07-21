import { Chat } from "./chat.js";
import { run, BuildResult } from "./build.js";
import { projectPath } from "./paths.js";

export class Executor {

    constructor(
        private chat: Chat
    ) {}

    async execute(task: string): Promise<string> {

        console.log("");
        console.log("Task");
        console.log(task);
        console.log("");

        const answer = await this.chat.send(task);

        console.log(answer);
        console.log("");

        return answer;

    }

    async buildFrontend(): Promise<BuildResult> {
        return run(
            "npm",
            ["run", "build"],
            projectPath("frontend")
        );
    }

    async buildBackend(): Promise<BuildResult> {
        return run(
            "python",
            ["-m", "pytest"],
            projectPath("backend")
        );
    }

}
