import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import {
  
  CommandCenter,
  saveCommandCenters,
} from "../api/commandCentersApi";
import { CommandCenterType } from "../../../common/src/types";

type CommandCenterDialogProps = {
  opened: boolean;
  onClose: () => void;
  onSave: (config: CommandCenter) => void;
  commandCenter: CommandCenter;
};

export default function CommandCenterDialog(p: CommandCenterDialogProps) {
  const [commandCenter, setCommandCenter] = useState<CommandCenter>(
    p.commandCenter.clone()
  );

  useEffect(() => {
    if (p.opened) {
      setCommandCenter(p.commandCenter.clone());
    }
  }, [p.commandCenter, p.opened]);

  const setType = (type: CommandCenterType) => {
    setCommandCenter((prev) => {
      const copy = prev.clone();
      copy.type = type;
      return copy;
    });
  };

  const setHost = (host: string) => {
    setCommandCenter((prev) => {
      const copy = prev.clone();

      if (copy.type === "z21") {
        copy.z21.host = host;
      } else if (copy.type === "dcc-ex-tcp") {
        copy.dccexTcp.host = host;
      }

      return copy;
    });
  };

  const setPort = (port: number) => {
    setCommandCenter((prev) => {
      const copy = prev.clone();

      if (copy.type === "z21") {
        copy.z21.port = port;
      } else if (copy.type === "dcc-ex-tcp") {
        copy.dccexTcp.port = port;
      }

      return copy;
    });
  };

  const setSerialPort = (serialPort: string) => {
    setCommandCenter((prev) => {
      const copy = prev.clone();
      copy.dccexSerial.serialPort = serialPort;
      return copy;
    });
  };

  const setAutoConnect = (checked: boolean) => {
    setCommandCenter((prev) => {
      const copy = prev.clone();
      copy.autoConnect = checked;
      return copy;
    });
  };

  const handleSave = async () => {
    await saveCommandCenters(commandCenter);
    p.onSave(commandCenter);
    
    p.onClose();
  };

  return (
    <Modal
      opened={p.opened}
      onClose={p.onClose}
      title="Command Center"
      centered
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Name"
          value={commandCenter.name}
          onChange={(e) =>
            setCommandCenter((prev) => {
              const copy = prev.clone();
              copy.name = e.target.value;
              return copy;
            })
          }
        />

        <Select
          label="Connection type"
          data={[
            { value: "z21", label: "Z21" },
            { value: "dcc-ex-tcp", label: "DCC-EX TCP" },
            { value: "dcc-ex-serial", label: "DCC-EX Serial" },
          ]}
          value={commandCenter.type}
          onChange={(v) => {
            if (v) setType(v as CommandCenterType);
          }}
        />

        {(commandCenter.type === "z21" ||
          commandCenter.type === "dcc-ex-tcp") && (
          <>
            <TextInput
              label="Host"
              placeholder="127.0.0.1"
              value={
                commandCenter.type === "z21"
                  ? commandCenter.z21.host ?? ""
                  : commandCenter.dccexTcp.host ?? ""
              }
              onChange={(e) => setHost(e.currentTarget.value)}
            />

            <NumberInput
              label="Port"
              placeholder="2560"
              min={1}
              max={65535}
              value={
                commandCenter.type === "z21"
                  ? commandCenter.z21.port ?? 0
                  : commandCenter.dccexTcp.port ?? 0
              }
              onChange={(v) => setPort(Number(v) || 0)}
            />
          </>
        )}

        {commandCenter.type === "dcc-ex-serial" && (
          <TextInput
            label="Serial port"
            placeholder="COM3 vagy /dev/ttyUSB0"
            value={commandCenter.dccexSerial.serialPort ?? ""}
            onChange={(e) => setSerialPort(e.currentTarget.value)}
          />
        )}

        <Checkbox
          label="Auto connect"
          checked={commandCenter.autoConnect ?? false}
          onChange={(e) => setAutoConnect(e.currentTarget.checked)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={p.onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </Group>
      </Stack>
    </Modal>
  );
}