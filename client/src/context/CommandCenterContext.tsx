// // src/context/CommandCenterContext.tsx

// import { createContext, useContext, useEffect, useState } from "react";
// import { wsClient } from "../services/wsClient";

// type CommandCenterLockState = {
//   locked: boolean;
//   lockOwner?: string | null;
//   reason?: string | null;
// };

// type CommandCenterContextValue = {
//   locked: boolean;
//   lockOwner: string | null;
//   reason: string | null;
// };

// const CommandCenterContext = createContext<CommandCenterContextValue>({
//   locked: false,
//   lockOwner: null,
//   reason: null,
// });

// export function CommandCenterProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [lockState, setLockState] = useState<CommandCenterLockState>({
//     locked: false,
//     lockOwner: null,
//     reason: null,
//   });

//   useEffect(() => {
//     const unsubscribeLockChanged = wsClient.on<CommandCenterLockState>(
//       "commandCenterLockChanged",
//       (data) => {
        
//         setLockState({
//           locked: data.locked,
//           lockOwner: data.lockOwner ?? null,
//           reason: data.reason ?? null,
//         });
//       }
//     );

//     return () => {
//       unsubscribeLockChanged();
//     };
//   }, []);

//   return (
//     <CommandCenterContext.Provider
//       value={{
//         locked: lockState.locked,
//         lockOwner: lockState.lockOwner ?? null,
//         reason: lockState.reason ?? null,
//       }}
//     >
//       {children}
//     </CommandCenterContext.Provider>
//   );
// }

// export function useCommandCenter() {
//   return useContext(CommandCenterContext);
// }


import { createContext, useContext, useEffect, useState } from "react";
import { wsClient } from "../services/wsClient";

type CommandCenterLockState = {
  locked: boolean;
  lockOwner?: string | null;
  reason?: string | null;
};

type CommandCenterInfoState = {
  alive: boolean;
  type?: string | null;
  name?: string | null;
  ip?: string | null;
  port?: number | null;
};

type PowerInfo = {
  emergencyStop: boolean;
  trackVoltageOn: boolean;
  trackVoltageOff: boolean;
  shortCircuit: boolean;
  programmingModeActive: boolean;
};

type Z21SystemState = {
  mainCurrentMa: number;
  progCurrentMa: number;
  filteredMainCurrentMa: number;
  temperatureC: number;
  supplyVoltageMv: number;
  vccVoltageMv: number;
  centralState: number;
  centralStateEx: number;
  reserved: number;
  capabilities: number;

  powerInfo: PowerInfo;

  flags: {
    highTemperature: boolean;
    powerLost: boolean;
    shortCircuitExternal: boolean;
    shortCircuitInternal: boolean;
    rcn213: boolean;

    capDcc: boolean;
    capMm: boolean;
    capRailCom: boolean;
    capLocoCmds: boolean;
    capAccessoryCmds: boolean;
    capDetectorCmds: boolean;
    capNeedsUnlockCode: boolean;
  };
};

type CommandCenterContextValue = {
  locked: boolean;
  lockOwner: string | null;
  reason: string | null;

  alive: boolean;
  type: string | null;
  name: string | null;
  ip: string | null;
  port: number | null;

  powerInfo: PowerInfo | null;
  z21SystemState: Z21SystemState | null;
};

const CommandCenterContext = createContext<CommandCenterContextValue>({
  locked: false,
  lockOwner: null,
  reason: null,

  alive: false,
  type: null,
  name: null,
  ip: null,
  port: null,

  powerInfo: null,
  z21SystemState: null,
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

  const [commandCenterInfo, setCommandCenterInfo] =
    useState<CommandCenterInfoState>({
      alive: false,
      type: null,
      name: null,
      ip: null,
      port: null,
    });

  const [powerInfo, setPowerInfo] = useState<PowerInfo | null>(null);
  const [z21SystemState, setZ21SystemState] =
    useState<Z21SystemState | null>(null);

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

    const unsubscribeCommandCenterInfo = wsClient.on<CommandCenterInfoState>(
      "commandCenterInfo",
      (data) => {
        setCommandCenterInfo((prev) => ({
          alive: data.alive,
          type: data.type ?? prev.type ?? null,
          name: data.name ?? prev.name ?? null,
          ip: data.ip ?? prev.ip ?? null,
          port: data.port ?? prev.port ?? null,
        }));
      }
    );

    const unsubscribePowerInfo = wsClient.on<PowerInfo>(
      "powerInfo",
      (data) => {
        setPowerInfo(data);
      }
    );

    const unsubscribeZ21SystemState = wsClient.on<Z21SystemState>(
      "z21SystemState",
      (data) => {
        setZ21SystemState(data);
        setPowerInfo(data.powerInfo);

        setCommandCenterInfo((prev) => ({
          ...prev,
          alive: true,
          type: prev.type ?? "z21",
        }));
      }
    );

    return () => {
      unsubscribeLockChanged();
      unsubscribeCommandCenterInfo();
      unsubscribePowerInfo();
      unsubscribeZ21SystemState();
    };
  }, []);

  return (
    <CommandCenterContext.Provider
      value={{
        locked: lockState.locked,
        lockOwner: lockState.lockOwner ?? null,
        reason: lockState.reason ?? null,

        alive: commandCenterInfo.alive,
        type: commandCenterInfo.type ?? null,
        name: commandCenterInfo.name ?? null,
        ip: commandCenterInfo.ip ?? null,
        port: commandCenterInfo.port ?? null,

        powerInfo,
        z21SystemState,
      }}
    >
      {children}
    </CommandCenterContext.Provider>
  );
}

export function useCommandCenter() {
  return useContext(CommandCenterContext);
}