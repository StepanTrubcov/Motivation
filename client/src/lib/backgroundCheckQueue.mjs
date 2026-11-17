// Run immediately; coalesce changes received during a request into one fresh pass.
export function createBackgroundCheckQueue(run, onError = () => {}) {
    let pending = false;
    let running = null;
    function requestCheck() {
        pending = true;
        if (running) return running;
        running = Promise.resolve().then(async () => {
            while (pending) {
                pending = false;
                try { await run(); } catch (error) { onError(error); }
            }
        }).finally(() => { running = null; });
        return running;
    }
    requestCheck.isIdle = () => !running && !pending;
    return requestCheck;
}
