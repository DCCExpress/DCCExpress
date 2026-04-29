// src/services/wsClient.ts

export type WsConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected"
    | "reconnecting"
    | "error";

export interface WsMessage<T = any> {
    type: string;
    data?: T;
     uuid?: string;
    
}

type StatusListener = (status: WsConnectionStatus) => void;
type MessageListener = (message: WsMessage) => void;
type TypedMessageListener<T = any> = (data: T, raw: WsMessage<T>) => void;

class WsClient {
    private socket: WebSocket | null = null;
    private status: WsConnectionStatus = "disconnected";

    private statusListeners = new Set<StatusListener>();
    private messageListeners = new Set<MessageListener>();
    private typedListeners = new Map<string, Set<TypedMessageListener>>();

    private reconnectTimer: number | null = null;
    private manuallyClosed = false;

    private reconnectAttempts = 0;
    private readonly reconnectDelayMs = 3000;
    private readonly maxReconnectDelayMs = 10000;

    private url = "";
    public uuid = crypto.randomUUID();

    public connect(url?: string) {
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

        this.socket.onmessage = (event: MessageEvent) => {
            try {
                console.log(event)
                this.handleIncoming(event.data);

            } catch (error) {
                console.log(error)
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

    public disconnect() {
        this.manuallyClosed = true;
        this.clearReconnectTimer();

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        this.setStatus("disconnected");
    }

    public send<T = any>(message: WsMessage<T>) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.warn("[WS] Cannot send, socket is not open:", message);
            return false;
        }
        
        this.socket.send(JSON.stringify({type: message.type, data: message.data, uuid: this.uuid}));
        return true;
    }

    public isConnected() {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    public getStatus() {
        return this.status;
    }

    public subscribeStatus(listener: StatusListener) {
        this.statusListeners.add(listener);
        listener(this.status);

        return () => {
            this.statusListeners.delete(listener);
        };
    }

    public subscribeMessages(listener: MessageListener) {
        this.messageListeners.add(listener);

        return () => {
            this.messageListeners.delete(listener);
        };
    }

    public on<T = any>(type: string, listener: TypedMessageListener<T>) {
        if (!this.typedListeners.has(type)) {
            this.typedListeners.set(type, new Set());
        }

        this.typedListeners.get(type)!.add(listener as TypedMessageListener);

        return () => {
            const listeners = this.typedListeners.get(type);
            if (!listeners) return;

            listeners.delete(listener as TypedMessageListener);

            if (listeners.size === 0) {
                this.typedListeners.delete(type);
            }
        };
    }

    private handleIncoming(rawData: any) {
        try {
            const message: WsMessage = JSON.parse(rawData);

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
        } catch (error) {
            console.error("[WS] Failed to parse message:", rawData, error);
        }
    }

    private scheduleReconnect() {
        this.clearReconnectTimer();

        this.reconnectAttempts++;

        const delay = Math.min(
            this.reconnectDelayMs * this.reconnectAttempts,
            this.maxReconnectDelayMs
        );

        console.log(`[WS] Reconnecting in ${delay} ms`);

        this.reconnectTimer = window.setTimeout(() => {
            this.connect();
        }, delay);
    }

    private clearReconnectTimer() {
        if (this.reconnectTimer !== null) {
            window.clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private setStatus(status: WsConnectionStatus) {
        this.status = status;

        for (const listener of this.statusListeners) {
            listener(status);
        }
    }
}

export const wsClient = new WsClient();