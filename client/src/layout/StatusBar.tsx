import { Badge, Group, Text } from "@mantine/core";
import { useWsStatus } from "../hooks/useWsStatus";
import { getWsColor } from "./TopMenuBar";
import { CommandCenter } from "../api/commandCentersApi";
import { useEffect, useState } from "react";

type StatusBarProps = {
  commandCenter: CommandCenter;
  alive: boolean;
};
export default function StatusBar(p: StatusBarProps) {

  const [commandCenter, setCommandCenter] = useState(p.commandCenter);
  const [commandCenterAlive, setCommandCenterAlive] = useState(false);

  const wsStatus = useWsStatus();

  useEffect(() => {
    setCommandCenter(p.commandCenter)
  }, [p.commandCenter])

  useEffect(() => {
    setCommandCenterAlive(p.alive);
  }, [p.alive])

  return (
    <Group h="100%" px="md" justify="space-between">

      <Group gap="md">

        {/* <Badge color={(commandCenterAlive && wsStatus == "connected") ? "green" : "red"} variant="filled" >CommandCenter: {commandCenter.infoText}</Badge> */}
        <Badge color={getWsColor(wsStatus)} variant="filled">
          {/* WS: {wsStatus} */}
          WS
        </Badge>
        <Badge color={(commandCenterAlive && wsStatus == "connected") ? "green" : "red"} variant="filled" >CC</Badge>

        <Badge color={(!commandCenterAlive && wsStatus == "connected") ? "green" : "red"} variant="filled" >PWR</Badge>

      </Group>

      {/* <Text size="sm" c="dimmed">
        Pálya nézet
      </Text> */}
    </Group>
  );
}