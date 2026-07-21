import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
export class CLI {
    rl = readline.createInterface({
        input: stdin,
        output: stdout
    });
    async ask(prompt = "> ") {
        return this.rl.question(prompt);
    }
    print(text) {
        console.log(text);
    }
    close() {
        this.rl.close();
    }
}
