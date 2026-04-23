import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Group,
  ScrollArea,
  SimpleGrid,
  Slider,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconPlayerStop,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
} from "@tabler/icons-react";

import LocoImage from "../components/loco/LocoImage";
import LocoPicker from "../components/loco/LocoPicker";
import { Loco } from "../../../common/src/types";

type Direction = "forward" | "reverse";

type LocoPanelProps = {
  locos?: Loco[];
};

const SPEED_PRESETS = [5, 10, 20, 40, 80, 100];

export default function LocoPanel({ locos = [] }: LocoPanelProps) {
  const [selectedLocoId, setSelectedLocoId] = useState<string>("");
  const [pickerOpened, setPickerOpened] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [direction, setDirection] = useState<Direction>("forward");
  const [activeFunctions, setActiveFunctions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!selectedLocoId && locos.length > 0) {
      setSelectedLocoId(locos[0]!.id);
    }

    if (selectedLocoId && !locos.some((l) => l.id === selectedLocoId)) {
      setSelectedLocoId(locos[0]?.id ?? "");
    }
  }, [locos, selectedLocoId]);

  const currentLoco = useMemo(() => {
    if (selectedLocoId) {
      const found = locos.find((l) => l.id === selectedLocoId);
      if (found) return found;
    }

    return locos.length > 0 ? locos[0] : null;
  }, [locos, selectedLocoId]);

  const handleSelectLoco = (loco: Loco) => {
    setSelectedLocoId(loco.id);
    setPickerOpened(false);
    setSpeed(0);
    setDirection("forward");
    setActiveFunctions({});
  };

  const handleForward = () => setDirection("forward");
  const handleReverse = () => setDirection("reverse");
  const handleStop = () => setSpeed(0);
  const handleEmergencyStop = () => setSpeed(0);

  const setSpeedByPercent = (percent: number) => {
    if (!currentLoco) return;

    const max = currentLoco.maxSpeed || 100;
    const calculated = Math.round((max * percent) / 100);
    const clamped = Math.max(0, Math.min(calculated, max));

    setSpeed(clamped);
  };

  const toggleFunction = (fnNumber: number, momentary: boolean) => {
    if (momentary) {
      setActiveFunctions((prev) => ({ ...prev, [fnNumber]: true }));
      window.setTimeout(() => {
        setActiveFunctions((prev) => ({ ...prev, [fnNumber]: false }));
      }, 200);
      return;
    }

    setActiveFunctions((prev) => ({
      ...prev,
      [fnNumber]: !prev[fnNumber],
    }));
  };

  return (
    <Card withBorder radius="sm" p="xs" h="100%">
      <div style={{ position: "relative", height: "100%" }}>
        <LocoPicker
          opened={pickerOpened}
          locos={locos}
          selectedLocoId={currentLoco?.id}
          onClose={() => setPickerOpened(false)}
          onSelect={handleSelectLoco}
        />

        <Stack gap="xs" h="100%">
          {!currentLoco ? (
            <Text size="sm" c="dimmed">
              Nincs még mozdony betöltve.
            </Text>
          ) : (
            <>
              <Card withBorder radius="sm" p="xs">
                <Stack gap="xs" align="center">
                  <LocoImage
                    image={currentLoco.image}
                    name={currentLoco.name}
                    width={400}
                    height={80}
                    clickable
                    onClick={() => setPickerOpened(true)}
                  />
                    <Text fw={700} ta="center">
                      #{currentLoco.address} {currentLoco.name || "Névtelen mozdony"}
                    </Text>

                  <Group grow>
                    <Button
                      size="xs"
                      variant={direction === "reverse" ? "filled" : "light"}
                      leftSection={<IconPlayerTrackPrev size={14} />}
                      onClick={handleReverse}
                    >
                      Hátra
                    </Button>

                    <Button
                      size="xs"
                      variant="light"
                      color="yellow"
                      leftSection={<IconPlayerStop size={14} />}
                      onClick={handleStop}
                    >
                      Stop
                    </Button>
                    <Button
                      size="xs"
                      variant={direction === "forward" ? "filled" : "light"}
                      rightSection={<IconPlayerTrackNext size={14} />}
                      onClick={handleForward}
                    >
                      Előre
                    </Button>

                  </Group>

                  
                    <Button
                      size="xs"
                      style={{width: "100%"}}
                      color="red"
                      leftSection={<IconAlertTriangle size={14} />}
                      onClick={handleEmergencyStop}
                    >
                      Emergency
                    </Button>
                  

                  <div style={{ width: "100%" }}>
                    <Group justify="space-between" mb={6}>
                      <Text size="sm" fw={500}>
                        Sebesség
                      </Text>
                      <Text size="sm" c="dimmed">
                        {speed} / {currentLoco.maxSpeed || 100}
                      </Text>
                    </Group>

                    <Slider
                      value={speed}
                      onChange={setSpeed}
                      min={0}
                      max={currentLoco.maxSpeed || 100}
                    />
                  </div>

                  <SimpleGrid cols={6} spacing="xs" p={0} w="100%">
                    {SPEED_PRESETS.map((preset) => (
                      <Button
                        key={preset}
                        size="xs"
                        variant="light"
                        onClick={() => setSpeedByPercent(preset)}
                      >
                        {preset}
                      </Button>
                    ))}
                  </SimpleGrid>
                </Stack>
              </Card>

              <Card withBorder radius="xs" p="xs" style={{ flex: 1, minHeight: 0 }}>
                <Stack gap="sm" h="100%">

                  <ScrollArea style={{ flex: 1 }}>
                    <SimpleGrid cols={5} spacing="xs" verticalSpacing="xs">
                      {Array.from({ length: 28 }, (_, i) => {
                        const fn = currentLoco.functions.find((f) => f.number === i);
                        const active = !!activeFunctions[i];
                        const hasName = !!fn?.name?.trim();

                        return (
                          <Button
                            key={i}
                            size="xs"
                            variant={active ? "filled" : "light"}
                            color={active ? "blue" : "gray"}
                            style={{
                              height: 48,
                              paddingTop: 2,
                              paddingBottom: 2,
                            }}
                            onClick={() => toggleFunction(i, fn?.momentary ?? false)}
                          >
                            <div style={{ textAlign: "center", lineHeight: 1.2 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  textAlign: "center",
                                }}
                              >
                                F{i}
                              </div>

                              {hasName && (
                                <div
                                  style={{
                                    fontSize: 12,
                                    opacity: 0.85,
                                    marginTop: 2,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textAlign: "center",
                                  }}
                                >
                                  {fn?.name}
                                  {fn?.momentary ? " *" : ""}
                                </div>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </SimpleGrid>
                  </ScrollArea>
                </Stack>
              </Card>
            </>
          )}
        </Stack>
      </div>
    </Card>
  );
}