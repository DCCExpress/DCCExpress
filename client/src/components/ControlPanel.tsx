import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconBolt,
  IconCode,
  IconPlayerPlay,
  IconPlugConnected,
  IconPlugConnectedX,
  IconRefresh,
} from "@tabler/icons-react";

type CommandCenterStatus = {
  alive?: boolean;
  name?: string;
  type?: string;
};

type ControlPanelProps = {
  commandCenter?: CommandCenterStatus;

  onConnectCommandCenter?: () => void;
  onDisconnectCommandCenter?: () => void;
  onRefreshCommandCenter?: () => void;

  onRunScript?: (script: string) => void;
};

export default function ControlPanel(p: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<string | null>("command-center");

  const [scriptName, setScriptName] = useState("Test script");
  const [script, setScript] = useState(`powerOn();

setTurnout(12, true);

setLoco({
  address: 3,
  speed: 40,
  direction: "forward"
});`);

  const commandCenterAlive = p.commandCenter?.alive === true;

  return (
    <Card withBorder radius="md" p="xs">
      <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false}>
        <Tabs.List grow>
          <Tabs.Tab
            value="command-center"
            leftSection={<IconBolt size={16} />}
          >
            Command
          </Tabs.Tab>

          <Tabs.Tab value="scripts" leftSection={<IconCode size={16} />}>
            Scripts
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="command-center" pt="sm">
          <CommandCenterTab
            commandCenter={p.commandCenter}
            alive={commandCenterAlive}
            onConnect={p.onConnectCommandCenter}
            onDisconnect={p.onDisconnectCommandCenter}
            onRefresh={p.onRefreshCommandCenter}
          />
        </Tabs.Panel>

        <Tabs.Panel value="scripts" pt="sm">
          <ScriptsTab
            scriptName={scriptName}
            script={script}
            onScriptNameChange={setScriptName}
            onScriptChange={setScript}
            onRun={() => p.onRunScript?.(script)}
          />
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}


type CommandCenterTabProps = {
  commandCenter: CommandCenterStatus | undefined;
  alive: boolean;
  onConnect: (() => void) | undefined;
  onDisconnect: (() => void) | undefined;
  onRefresh: (() => void) | undefined;
};

function CommandCenterTab(p: CommandCenterTabProps) {
  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Box>
          <Text size="sm" fw={700}>
            Command Center
          </Text>

          <Text size="xs" c="dimmed">
            Z21 / DCC-EX kapcsolat állapota
          </Text>
        </Box>

        <Badge color={p.alive ? "green" : "red"} variant="light">
          {p.alive ? "ONLINE" : "OFFLINE"}
        </Badge>
      </Group>

      <Divider />

      <Stack gap={4}>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Name
          </Text>
          <Text size="xs" fw={600}>
            {p.commandCenter?.name ?? "-"}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Type
          </Text>
          <Text size="xs" fw={600}>
            {p.commandCenter?.type ?? "-"}
          </Text>
        </Group>
      </Stack>

      <Group grow mt="xs">
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlugConnected size={16} />}
          onClick={p.onConnect}
          disabled={p.alive}
        >
          Connect
        </Button>

        <Button
          size="xs"
          variant="light"
          color="red"
          leftSection={<IconPlugConnectedX size={16} />}
          onClick={p.onDisconnect}
          disabled={!p.alive}
        >
          Disconnect
        </Button>
      </Group>

      <Group justify="flex-end">
        <Tooltip label="Állapot frissítése">
          <ActionIcon variant="subtle" onClick={p.onRefresh}>
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Stack>
  );
}

type ScriptsTabProps = {
  scriptName: string;
  script: string;
  onScriptNameChange: (value: string) => void;
  onScriptChange: (value: string) => void;
  onRun: () => void;
};

function ScriptsTab(p: ScriptsTabProps) {
  return (
    <Stack gap="xs">
      <Box>
        <Text size="sm" fw={700}>
          Scripts
        </Text>

        <Text size="xs" c="dimmed">
          DCCExpress parancsok teszteléshez
        </Text>
      </Box>

      <Textarea
        label="Script"
        value={p.script}
        onChange={(e) => p.onScriptChange(e.currentTarget.value)}
        autosize
        minRows={8}
        maxRows={16}
        styles={{
          input: {
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 12,
          },
        }}
      />

      <Group justify="flex-end">
        <Button
          size="xs"
          leftSection={<IconPlayerPlay size={16} />}
          onClick={p.onRun}
        >
          Run script
        </Button>
      </Group>
    </Stack>
  );
}