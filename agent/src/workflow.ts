import { Executor } from "./executor.js";
import { Planner } from "./planner.js";
import { State } from "./state.js";

export interface TaskResult {
    task: string;
    answer: string;
}

export class Workflow {

    constructor(
        private planner: Planner,
        private executor: Executor,
        private state: State
    ) {}

    async initialize(goal: string): Promise<string[]> {

        this.state.setGoal(goal);

        const rawPlan =
        await this.planner.createPlan(goal);

        const plan = rawPlan
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean);

        this.state.setPlan(plan);

        return plan;

    }

    async runNextTask(): Promise<TaskResult | null> {

        const task =
        this.state.nextTask();

        if (!task) {
            return null;
        }

        console.log("");
        console.log("================================");
        console.log(task);
        console.log("================================");
        console.log("");

        const answer = await this.executor.execute(task);

        this.state.finishTask();

        return { task, answer };

    }

    isDone(): boolean {
        return this.state.nextTask() === null;
    }

}
