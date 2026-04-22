// src/hooks/useWsStatus.ts

import { useEffect, useState } from "react";
import { wsClient, WsConnectionStatus } from "../services/wsClient";

export function useWsStatus(): WsConnectionStatus {
  const [status, setStatus] = useState<WsConnectionStatus>(wsClient.getStatus());

  useEffect(() => {
    return wsClient.subscribeStatus(setStatus);
  }, []);

  return status;
}