import { useEffect, useMemo, useState } from "react";
import {
  Badge,
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
import type { Loco } from "../types/loco";
import LocoImage from "../components/loco/LocoImage";
import LocoPicker from "../components/loco/LocoPicker";

type Direction = "forward" | "reverse";

type LocoPanelProps = {
  locos?: Loco[];
  collapsed?: boolean;
};

export default function LocoPanel({
  locos = [],
  collapsed = false,
}: LocoPanelProps) {
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

  if (collapsed) {
    return (
      <Card withBorder radius="sm" p="xs" h="100%">
        <Stack align="center" gap="xs">

          {currentLoco ? (
            <LocoImage
              image={currentLoco.image}
              name={currentLoco.name}
              width={56}
              height={56}
              clickable
              onClick={() => setPickerOpened(true)}
            />
          ) : (
            <Text size="xs" c="dimmed" ta="center">
              Nincs mozdony
            </Text>
          )}

          <LocoPicker
            opened={pickerOpened}
            locos={locos}
            selectedLocoId={currentLoco?.id}
            onClose={() => setPickerOpened(false)}
            onSelect={handleSelectLoco}
          />
        </Stack>
      </Card>
    );
  }

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
                <Group align="flex-start" wrap="nowrap">
                  <LocoImage
                    image={currentLoco.image}
                    name={currentLoco.name}
                    width={120}
                    height={90}
                    clickable
                    onClick={() => setPickerOpened(true)}
                  />

                  <Group gap={6}>
                    <Text fw={700}>{currentLoco.name || "Névtelen mozdony"}</Text>
                    <Text size="sm" c="dimmed">
                      DCC cím: {currentLoco.address}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Max sebesség: {currentLoco.maxSpeed}
                    </Text>

                    {/* <Group gap="xs" mt={4}>
                      <Badge variant="light" color={direction === "forward" ? "green" : "gray"}>
                        Előre
                      </Badge>
                      <Badge variant="light" color={direction === "reverse" ? "orange" : "gray"}>
                        Hátra
                      </Badge>
                    </Group> */}

                    {/* <Text size="xs" c="dimmed">
                      Katt a képre a mozdony kiválasztásához
                    </Text> */}
                  </Group>
                </Group>
              {/* </Card>

              <Card withBorder radius="sm" p="md"> */}
                <Stack gap="xs">
                  {/* <Text fw={600}>Menetvezérlés</Text> */}

                  <Group grow>
                    <Button
                      size="xs"
                      variant={direction === "forward" ? "filled" : "light"}
                      leftSection={<IconPlayerTrackNext size={14} />}
                      onClick={handleForward}
                    >
                      Előre
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
                      variant={direction === "reverse" ? "filled" : "light"}
                      leftSection={<IconPlayerTrackPrev size={14} />}
                      onClick={handleReverse}
                    >
                      Hátra
                    </Button>
                  </Group>

                  <Group grow>

                    <Button
                      size="xs"
                      color="red"
                      leftSection={<IconAlertTriangle size={14} />}
                      onClick={handleEmergencyStop}
                    >
                      Emergency
                    </Button>
                  </Group>

                  <div>
                    <Group justify="space-between" mb={6}>
                      <Text size="sm" fw={500}>
                        Sebesség
                      </Text>
                      <Text size="sm" c="dimmed">
                        {speed}
                      </Text>
                    </Group>

                    <Slider
                      value={speed}
                      onChange={setSpeed}
                      min={0}
                      max={currentLoco.maxSpeed || 100}
                    />
                  </div>
                </Stack>
              </Card>

              <Card withBorder radius="xs" p="xs" style={{ flex: 1, minHeight: 0 }}>
                <Stack gap="sm" h="100%">
                  <Text fw={600}>Funkciók</Text>

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
                              height: 54,
                              paddingTop: 2,
                              paddingBottom: 2,
                            }}
                            onClick={() => toggleFunction(i, fn?.momentary ?? false)}
                          >
                            <div style={{ textAlign: "center", lineHeight: 1.2 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, textAlign: "center" }}>F{i}</div>
                              {hasName && (
                                <div
                                  style={{
                                    fontSize: 12,
                                    opacity: 0.85,
                                    marginTop: 2,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textAlign: "center"
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