import {
    CopilotSession
} from "@github/copilot-sdk";

export class Chat {

    constructor(
        private session: CopilotSession
    ) {}

    async send(prompt: string) {

        const response =
        await this.session.sendAndWait({
            prompt
        });

        if (!response)
            return "";

        return response.data.content;

    }

}
