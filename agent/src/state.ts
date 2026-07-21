export interface AgentState {
    goal: string;
    plan: string[];
    currentTask: number;
    completed: string[];
}

function emptyState(): AgentState {
    return {
        goal: "",
        plan: [],
        currentTask: 0,
        completed: []
    };
}

export class State {

    private state: AgentState = emptyState();

    get() {
        return this.state;
    }

    restore(saved: AgentState) {
        this.state = saved;
    }

    reset() {
        this.state = emptyState();
    }

    setGoal(goal: string) {
        this.state.goal = goal;
    }

    setPlan(plan: string[]) {
        this.state.plan = plan;
        this.state.currentTask = 0;
    }

    nextTask() {
        if (this.state.currentTask >= this.state.plan.length)
            return null;

        return this.state.plan[this.state.currentTask];
    }

    finishTask() {
        const task = this.nextTask();

        if (!task)
            return;

        this.state.completed.push(task);
        this.state.currentTask++;
    }

}
