const listeners = new Set();
export function onLocosChanged(listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
export async function notifyLocosChanged() {
    for (const listener of listeners) {
        try {
            await listener();
        }
        catch (error) {
            console.error("locosChanged listener failed:", error);
        }
    }
}
