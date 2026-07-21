/**
 * sendAndWait()'s built-in timeout (default 60s) is a flat wall-clock limit
 * that does not reset on activity - a long, multi-tool task (reading many
 * files, writing several new ones) can easily take longer than that and
 * will throw even though the assistant is actively working.
 *
 * Instead we drive the session ourselves via send() + on(), and use an
 * inactivity timeout that resets every time we see ANY event. Only genuine
 * silence (the session going quiet and never becoming idle) trips it.
 */
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes of total silence
export class Chat {
    session;
    constructor(session) {
        this.session = session;
    }
    send(prompt) {
        return new Promise((resolve, reject) => {
            let content = "";
            let timer;
            const seenTools = new Set();
            const cleanUp = () => {
                clearTimeout(timer);
                unsubscribe();
            };
            const resetTimer = () => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    cleanUp();
                    reject(new Error(`No activity from the assistant for ${INACTIVITY_TIMEOUT_MS / 1000}s - ` +
                        "it may be stuck. The task was not marked complete, so you can safely retry it."));
                }, INACTIVITY_TIMEOUT_MS);
            };
            const unsubscribe = this.session.on((event) => {
                resetTimer();
                switch (event.type) {
                    case "assistant.tool_call_delta": {
                        const name = event.data.toolName;
                        if (name && !seenTools.has(event.data.toolCallId)) {
                            seenTools.add(event.data.toolCallId);
                            console.log(`  -> ${name}`);
                        }
                        break;
                    }
                    case "assistant.message":
                        content = event.data.content;
                        break;
                    case "session.idle":
                        cleanUp();
                        resolve(content);
                        break;
                    case "session.error":
                        cleanUp();
                        reject(new Error(event.data.message));
                        break;
                }
            });
            resetTimer();
            this.session.send({ prompt }).catch(err => {
                cleanUp();
                reject(err);
            });
        });
    }
}
