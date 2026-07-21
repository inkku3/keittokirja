import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

export class CLI {

    private rl = readline.createInterface({
        input: stdin,
        output: stdout
    });

    async ask(prompt = "> "): Promise<string> {
        return this.rl.question(prompt);
    }

    print(text: string) {
        console.log(text);
    }

    close() {
        this.rl.close();
    }

}
