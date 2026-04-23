// src/hooks/useWsStatus.ts
import { useEffect, useState } from "react";
import { wsClient } from "../services/wsClient";
export function useWsStatus() {
    const [status, setStatus] = useState(wsClient.getStatus());
    useEffect(() => {
        return wsClient.subscribeStatus(setStatus);
    }, []);
    return status;
}
