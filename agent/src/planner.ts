import { Chat } from "./chat.js";

export class Planner {

    constructor(
        private chat: Chat
    ) {}

    async createPlan(goal: string) {

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
