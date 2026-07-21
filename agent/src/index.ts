import { CookbookAgent } from "./agent.js";

const agent =
new CookbookAgent();

agent
.start()
.catch(console.error);
