// src/context/CommandCenterContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import { wsClient } from "../services/wsClient";

type CommandCenterLockState = {
  locked: boolean;
  lockOwner?: string | null;
  reason?: string | null;
};

type CommandCenterContextValue = {
  locked: boolean;
  lockOwner: string | null;
  reason: string | null;
};

const CommandCenterContext = createContext<CommandCenterContextValue>({
  locked: false,
  lockOwner: null,
  reason: null,
});

export function CommandCenterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lockState, setLockState] = useState<CommandCenterLockState>({
    locked: false,
    lockOwner: null,
    reason: null,
  });

  useEffect(() => {
    const unsubscribeLockChanged = wsClient.on<CommandCenterLockState>(
      "commandCenterLockChanged",
      (data) => {
        
        setLockState({
          locked: data.locked,
          lockOwner: data.lockOwner ?? null,
          reason: data.reason ?? null,
        });
      }
    );

    return () => {
      unsubscribeLockChanged();
    };
  }, []);

  return (
    <CommandCenterContext.Provider
      value={{
        locked: lockState.locked,
        lockOwner: lockState.lockOwner ?? null,
        reason: lockState.reason ?? null,
      }}
    >
      {children}
    </CommandCenterContext.Provider>
  );
}

export function useCommandCenter() {
  return useContext(CommandCenterContext);
}