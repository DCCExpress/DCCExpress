// src/hooks/useWsMessage.ts
import { useEffect } from "react";
import { wsClient } from "../services/wsClient";
export function useWsMessage(type, handler) {
    useEffect(() => {
        const unsubscribe = wsClient.on(type, (data) => {
            handler(data);
        });
        return unsubscribe;
    }, [type, handler]);
}
