import { Badge, Divider, Group } from "@mantine/core";
import { useWsStatus } from "../hooks/useWsStatus";
import { getWsColor } from "./TopMenuBar";
import { useCommandCenter } from "../context/CommandCenterContext";
import { useBrowserStats } from "../hooks/useBrowserStats";
import "../styles/global.css"

export default function StatusBar() {
  const wsStatus = useWsStatus();
  const browserStats = useBrowserStats(1000);
  const {
    alive,
    type,
    name,
    powerInfo,
    locked,
  } = useCommandCenter();

  const wsConnected = wsStatus === "connected";
  const commandCenterOnline = alive && wsConnected;
  const trackPowerOn = powerInfo?.trackVoltageOn === true && wsConnected;

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="md">
        <Badge color={getWsColor(wsStatus)} variant="filled">
          WS
        </Badge>

        <Badge color={commandCenterOnline ? "green" : "red"} variant="filled">
          {type ?? name ?? "CC"}
        </Badge>

        <Badge color={trackPowerOn ? "green" : "red"} variant="filled">
          PWR
        </Badge>


        <Badge
          color={locked ? "orange" : "gray"}
          variant="filled"
          {...(locked ? { className: "blinkBadge" } : {})}
        >
          {locked ? "LOCK" : "FREE"}
        </Badge>

        <Divider orientation="vertical" />

        <Badge color={getMemoryColor(browserStats.memoryUsedMb)} variant="filled">
          JS {browserStats.memoryUsedMb ?? "-"} MB
          
        </Badge>

        <Badge color={getFpsColor(browserStats.fps)} variant="filled">
          FPS {browserStats.fps ?? "-"}
        </Badge>

        <Badge color="blue" variant="filled">
          CPU {browserStats.cpuThreads ?? "-"}
        </Badge>

      </Group>
    </Group>
  );
}

function getMemoryColor(memoryUsedMb: number | null): string {
  if (memoryUsedMb === null) return "gray";
  if (memoryUsedMb > 1000) return "red";
  if (memoryUsedMb > 600) return "orange";
  return "green";
}

function getFpsColor(fps: number | null): string {
  if (fps === null) return "gray";
  if (fps < 30) return "red";
  if (fps < 50) return "orange";
  return "green";
}