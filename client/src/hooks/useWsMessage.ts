// src/hooks/useWsMessage.ts

import { useEffect } from "react";
import { wsClient } from "../services/wsClient";

export function useWsMessage<T = any>(
  type: string,
  handler: (data: T) => void
) {
  useEffect(() => {
    const unsubscribe = wsClient.on<T>(type, (data) => {
      handler(data);
    });

    return unsubscribe;
  }, [type, handler]);
}