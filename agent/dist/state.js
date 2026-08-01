function emptyState() {
    return {
        goal: "",
        plan: [],
        currentTask: 0,
        completed: []
    };
}
export class State {
    state = emptyState();
    get() {
        return this.state;
    }
    restore(saved) {
        this.state = saved;
    }
    reset() {
        this.state = emptyState();
    }
    setGoal(goal) {
        this.state.goal = goal;
    }
    setPlan(plan) {
        this.state.plan = plan;
        this.state.currentTask = 0;
    }
    nextTask() {
        if (this.state.currentTask >= this.state.plan.length)
            return null;
        return this.state.plan[this.state.currentTask];
    }
    skipTask() {
        const task = this.nextTask();
        if (!task)
            return null;
        this.state.currentTask++;
        return task;
    }
    finishTask() {
        const task = this.nextTask();
        if (!task)
            return;
        this.state.completed.push(task);
        this.state.currentTask++;
    }
}
