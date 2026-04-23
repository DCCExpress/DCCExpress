// src/services/wsClient.ts
class WsClient {
    socket = null;
    status = "disconnected";
    statusListeners = new Set();
    messageListeners = new Set();
    typedListeners = new Map();
    reconnectTimer = null;
    manuallyClosed = false;
    reconnectAttempts = 0;
    reconnectDelayMs = 3000;
    maxReconnectDelayMs = 10000;
    url = "";
    connect(url) {
        if (url) {
            this.url = url;
        }
        if (!this.url) {
            console.error("WebSocket URL is missing.");
            return;
        }
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }
        this.clearReconnectTimer();
        this.manuallyClosed = false;
        this.setStatus(this.reconnectAttempts > 0 ? "reconnecting" : "connecting");
        this.socket = new WebSocket(this.url);
        this.socket.onopen = () => {
            this.reconnectAttempts = 0;
            this.setStatus("connected");
            console.log("[WS] Connected:", this.url);
        };
        this.socket.onmessage = (event) => {
            try {
                console.log(event);
                this.handleIncoming(event.data);
            }
            catch (error) {
                console.log(error);
            }
        };
        this.socket.onerror = (error) => {
            console.error("[WS] Error:", error);
            this.setStatus("error");
        };
        this.socket.onclose = () => {
            console.warn("[WS] Closed");
            this.socket = null;
            this.setStatus("disconnected");
            if (!this.manuallyClosed) {
                this.scheduleReconnect();
            }
        };
    }
    disconnect() {
        this.manuallyClosed = true;
        this.clearReconnectTimer();
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.setStatus("disconnected");
    }
    send(message) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.warn("[WS] Cannot send, socket is not open:", message);
            return false;
        }
        this.socket.send(JSON.stringify(message));
        return true;
    }
    isConnected() {
        return this.socket?.readyState === WebSocket.OPEN;
    }
    getStatus() {
        return this.status;
    }
    subscribeStatus(listener) {
        this.statusListeners.add(listener);
        listener(this.status);
        return () => {
            this.statusListeners.delete(listener);
        };
    }
    subscribeMessages(listener) {
        this.messageListeners.add(listener);
        return () => {
            this.messageListeners.delete(listener);
        };
    }
    on(type, listener) {
        if (!this.typedListeners.has(type)) {
            this.typedListeners.set(type, new Set());
        }
        this.typedListeners.get(type).add(listener);
        return () => {
            const listeners = this.typedListeners.get(type);
            if (!listeners)
                return;
            listeners.delete(listener);
            if (listeners.size === 0) {
                this.typedListeners.delete(type);
            }
        };
    }
    handleIncoming(rawData) {
        try {
            const message = JSON.parse(rawData);
            if (!message || typeof message.type !== "string") {
                console.warn("[WS] Invalid message format:", rawData);
                return;
            }
            for (const listener of this.messageListeners) {
                listener(message);
            }
            const listeners = this.typedListeners.get(message.type);
            if (listeners) {
                for (const listener of listeners) {
                    listener(message.data, message);
                }
            }
        }
        catch (error) {
            console.error("[WS] Failed to parse message:", rawData, error);
        }
    }
    scheduleReconnect() {
        this.clearReconnectTimer();
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelayMs * this.reconnectAttempts, this.maxReconnectDelayMs);
        console.log(`[WS] Reconnecting in ${delay} ms`);
        this.reconnectTimer = window.setTimeout(() => {
            this.connect();
        }, delay);
    }
    clearReconnectTimer() {
        if (this.reconnectTimer !== null) {
            window.clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
    setStatus(status) {
        this.status = status;
        for (const listener of this.statusListeners) {
            listener(status);
        }
    }
}
export const wsClient = new WsClient();
