export class Workflow {
    planner;
    executor;
    state;
    constructor(planner, executor, state) {
        this.planner = planner;
        this.executor = executor;
        this.state = state;
    }
    async initialize(goal) {
        this.state.setGoal(goal);
        const rawPlan = await this.planner.createPlan(goal);
        const plan = rawPlan
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean);
        this.state.setPlan(plan);
        return plan;
    }
    async runNextTask() {
        const task = this.state.nextTask();
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
    isDone() {
        return this.state.nextTask() === null;
    }
}
