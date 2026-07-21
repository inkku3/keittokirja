export class Planner {
    chat;
    constructor(chat) {
        this.chat = chat;
    }
    async createPlan(goal) {
        const prompt = `

        Create a numbered implementation plan.

        Goal:
        ${goal}

        Rules

        - small steps
        - one feature at a time
        - no code

        Return only the numbered plan, one step per line.
        `;
        return this.chat.send(prompt);
    }
}
