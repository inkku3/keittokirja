import { CopilotClient, approveAll } from "@github/copilot-sdk";
import { CLI } from "./cli.js";
import { Chat } from "./chat.js";
import { Planner } from "./planner.js";
import { Executor } from "./executor.js";
import { State } from "./state.js";
import { Workflow } from "./workflow.js";
import { History } from "./history.js";
import { COMMANDS } from "./commands.js";
import { inspectRepository } from "./repository.js";
import * as checkpoint from "./checkpoint.js";
import { SYSTEM_GOAL } from "./prompts.js";
import { PROJECT_ROOT } from "./paths.js";
export class CookbookAgent {
    client;
    state = new State();
    history = new History();
    async start() {
        console.clear();
        console.log("Cookbook Migration Agent");
        console.log("");
        await this.printRepositoryInfo();
        await this.restoreCheckpoint();
        this.client =
            new CopilotClient({
                workingDirectory: PROJECT_ROOT
            });
        await this.client.start();
        const session = await this.client.createSession({
            model: "gpt-5",
            onPermissionRequest: approveAll,
            systemMessage: {
                content: SYSTEM_GOAL
            }
        });
        const chat = new Chat(session);
        const planner = new Planner(chat);
        const executor = new Executor(chat);
        const workflow = new Workflow(planner, executor, this.state);
        const cli = new CLI();
        console.log("Connected.");
        console.log("");
        this.printHelp();
        console.log("");
        while (true) {
            const input = (await cli.ask("> ")).trim();
            if (!input) {
                continue;
            }
            if (input === COMMANDS.exit || input === "quit") {
                break;
            }
            try {
                await this.handleInput(input, { chat, planner, executor, workflow });
            }
            catch (err) {
                console.log("");
                console.log(`Error: ${err instanceof Error ? err.message : String(err)}`);
                console.log("Nothing was lost - your plan/progress is unaffected. Try again, or /status to check state.");
                console.log("");
            }
        }
        await this.saveCheckpoint();
        cli.close();
        await session.disconnect();
        await this.client.stop();
    }
    async handleInput(input, deps) {
        const { chat, executor, workflow } = deps;
        if (input === COMMANDS.help) {
            this.printHelp();
            return;
        }
        if (input.startsWith(COMMANDS.plan)) {
            const goal = input.slice(COMMANDS.plan.length).trim();
            if (!goal) {
                console.log(`Usage: ${COMMANDS.plan} <goal description>`);
                return;
            }
            console.log("");
            console.log("Planning...");
            const plan = await workflow.initialize(goal);
            console.log("");
            console.log("Plan:");
            plan.forEach(step => console.log(`  ${step}`));
            console.log("");
            await this.saveCheckpoint();
            return;
        }
        if (input === COMMANDS.migrate) {
            if (this.state.get().plan.length === 0) {
                console.log(`No plan yet. Use ${COMMANDS.plan} <goal> first.`);
                return;
            }
            while (!workflow.isDone()) {
                try {
                    const result = await workflow.runNextTask();
                    if (!result) {
                        break;
                    }
                    this.history.add({
                        task: result.task,
                        summary: result.answer.slice(0, 500),
                        success: true,
                        timestamp: new Date()
                    });
                    await this.saveCheckpoint();
                }
                catch (err) {
                    // The failing task was NOT marked finished, so state.currentTask
                    // still points at it - running /migrate again retries just that task.
                    console.log("");
                    console.log(`Task failed: ${err instanceof Error ? err.message : String(err)}`);
                    console.log("Progress on earlier tasks is saved. Run /migrate again to retry this task.");
                    console.log("");
                    return;
                }
            }
            console.log("Migration complete.");
            console.log("");
            return;
        }
        if (input === COMMANDS.status) {
            const s = this.state.get();
            console.log("");
            console.log(`Goal:     ${s.goal || "(none set)"}`);
            console.log(`Progress: ${s.completed.length}/${s.plan.length} tasks`);
            if (s.plan.length > 0 && s.currentTask < s.plan.length) {
                console.log(`Next:     ${s.plan[s.currentTask]}`);
            }
            console.log("");
            return;
        }
        if (input === COMMANDS.reset) {
            this.state.reset();
            this.history.entries = [];
            await checkpoint.remove();
            console.log("State and history cleared.");
            console.log("");
            return;
        }
        if (input === COMMANDS.build) {
            console.log("");
            console.log("Building frontend...");
            const feResult = await executor.buildFrontend();
            console.log(feResult.output.trim() || "(no output)");
            console.log(feResult.success ? "Frontend build OK." : "Frontend build FAILED.");
            console.log("");
            console.log("Testing backend...");
            const beResult = await executor.buildBackend();
            console.log(beResult.output.trim() || "(no output)");
            console.log(beResult.success ? "Backend tests OK." : "Backend tests FAILED.");
            console.log("");
            return;
        }
        // Anything else goes straight to the assistant as a free-form message.
        console.log("");
        const answer = await chat.send(input);
        console.log(answer);
        console.log("");
    }
    printHelp() {
        console.log("Commands:");
        console.log(`  ${COMMANDS.plan} <goal>   create a migration plan for <goal>`);
        console.log(`  ${COMMANDS.migrate}         run all remaining plan tasks one by one`);
        console.log(`  ${COMMANDS.status}          show current progress`);
        console.log(`  ${COMMANDS.build}           run frontend build + backend tests`);
        console.log(`  ${COMMANDS.reset}           clear saved plan, progress, and history`);
        console.log(`  ${COMMANDS.help}            show this help`);
        console.log(`  ${COMMANDS.exit}            save progress and quit`);
        console.log("  <anything else>     sent directly to the assistant as chat");
    }
    async printRepositoryInfo() {
        const repo = await inspectRepository();
        console.log(`Project root: ${PROJECT_ROOT}`);
        console.log("Repository check:");
        console.log(`  frontend/    ${repo.frontend ? "found" : "missing"}`);
        console.log(`  backend/     ${repo.backend ? "found" : "missing"}`);
        console.log(`  legacy/      ${repo.legacy ? "found" : "missing"}`);
        console.log(`  package.json ${repo.packageJson ? "found" : "missing"}`);
        console.log("");
    }
    async restoreCheckpoint() {
        const saved = await checkpoint.load();
        if (!saved) {
            return;
        }
        if (saved.state) {
            this.state.restore(saved.state);
        }
        if (saved.history) {
            this.history.entries = saved.history.map(e => ({
                ...e,
                timestamp: new Date(e.timestamp)
            }));
        }
        console.log("Restored previous session state from .agent-state.json");
        console.log("");
    }
    async saveCheckpoint() {
        const data = {
            state: this.state.get(),
            history: this.history.entries.map(e => ({
                ...e,
                timestamp: e.timestamp.toISOString()
            }))
        };
        await checkpoint.save(data);
    }
}
