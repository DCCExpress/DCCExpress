import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FileButton,
  Group,
  Loader,
  NumberInput,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconPhoto, IconPlus, IconTrash } from "@tabler/icons-react";
import { getLocos, saveLocos } from "../api/http";
import { generateId } from "../helpers";
import { Loco, LocoFunction } from "../../../common/src/types";

type LocoDialogProps = {
  opened: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

const createEmptyLoco = (): Loco => ({
  id: generateId(),
  name: "",
  address: 3,
  maxSpeed: 100,
  invert: false,
  image: "",
  functions: [],
});

const createDefaultFunction = (nextNumber: number): LocoFunction => ({
  id: crypto.randomUUID(),
  number: nextNumber,
  name: `F${nextNumber}`,
  icon: "💡",
  momentary: false,
});

export default function LocoDialog({ opened, onClose, onSaved }: LocoDialogProps) {
  const [locos, setLocos] = useState<Loco[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!opened) return;

    const load = async () => {
      try {
        setLoading(true);
        setMessage("");

        const data = await getLocos();
        setLocos(data);

        if (data.length > 0) {
          setSelectedId(data[0]!.id);
        } else {
          setSelectedId("");
        }
      } catch (error) {
        console.error(error);
        setMessage("Nem sikerült betölteni a mozdonyokat.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [opened]);

  useEffect(() => {
    if (!selectedId && locos.length > 0) {
      setSelectedId(locos[0]!.id);
    }
  }, [locos, selectedId]);

  const selectedLoco = useMemo(
    () => locos.find((l) => l.id === selectedId) ?? null,
    [locos, selectedId]
  );

  const updateSelectedLoco = (patch: Partial<Loco>) => {
    if (!selectedLoco) return;

    setLocos((prev) =>
      prev.map((l) => (l.id === selectedLoco.id ? { ...l, ...patch } : l))
    );
  };

  const addLoco = () => {
    const loco = createEmptyLoco();
    setLocos((prev) => [...prev, loco]);
    setSelectedId(loco.id);
  };

  const deleteSelectedLoco = () => {
    if (!selectedLoco) return;

    const next = locos.filter((l) => l.id !== selectedLoco.id);
    setLocos(next);
    setSelectedId(next[0]?.id ?? "");
  };

  const addFunction = () => {
    if (!selectedLoco) return;

    const maxFn = selectedLoco.functions.reduce(
      (max, fn) => Math.max(max, fn.number),
      -1
    );

    const nextFn = createDefaultFunction(maxFn + 1);

    updateSelectedLoco({
      functions: [...selectedLoco.functions, nextFn],
    });
  };

  const updateFunction = (fnId: string, patch: Partial<LocoFunction>) => {
    if (!selectedLoco) return;

    updateSelectedLoco({
      functions: selectedLoco.functions.map((fn) =>
        fn.id === fnId ? { ...fn, ...patch } : fn
      ),
    });
  };

  const deleteFunction = (fnId: string) => {
    if (!selectedLoco) return;

    updateSelectedLoco({
      functions: selectedLoco.functions.filter((fn) => fn.id !== fnId),
    });
  };

  const setImageFromFile = (file: File | null) => {
    if (!file || !selectedLoco) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateSelectedLoco({
        image: typeof reader.result === "string" ? reader.result : "",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      await saveLocos(locos);
      setMessage("Mentés sikerült.");
      onSaved?.();

    } catch (error) {
      console.error(error);
      setMessage("Nem sikerült elmenteni a mozdonyokat.");
    } finally {
      setSaving(false);
    }
  };

  if (!opened) return null;

  return (
    <Box
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Card
        withBorder
        radius="sm"
        p="md"
        style={{
          width: "min(1200px, 95vw)",
          height: "min(760px, 92vh)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Group justify="space-between" mb="md">
          <div>
            <Title order={3}>Mozdonyok</Title>
            <Text size="sm" c="dimmed">
              Mozdony törzsadatok és funkciók szerkesztése
            </Text>
          </div>

        </Group>

        <Divider mb="md" />

        {loading ? (
          <Stack align="center" justify="center" style={{ flex: 1 }}>
            <Loader />
            <Text size="sm" c="dimmed">
              Mozdonyok betöltése...
            </Text>
          </Stack>
        ) : (
          <Group
            align="stretch"
            gap="md"
            style={{ flex: 1, minHeight: 0, flexWrap: "nowrap" }}
          >
            <Card
              withBorder
              radius="sm"
              p="sm"
              style={{ width: 320, display: "flex", flexDirection: "column" }}
            >
              <Group justify="space-between" mb="sm">
                <Text fw={600}>Mozdony lista</Text>
                <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addLoco}>
                  Új
                </Button>
              </Group>

              <ScrollArea style={{ flex: 1 }}>
                <Stack gap="xs">
                  {locos.map((loco) => (
                    <Card
                      key={loco.id}
                      withBorder
                      radius="sm"
                      p="sm"
                      style={{
                        cursor: "pointer",
                        borderColor:
                          loco.id === selectedId
                            ? "var(--mantine-color-blue-5)"
                            : undefined,
                        backgroundColor:
                          loco.id === selectedId
                            ? "var(--mantine-color-blue-0)"
                            : undefined,
                      }}
                      onClick={() => setSelectedId(loco.id)}
                    >
                      <Group
                        align="stretch"
                        gap="sm"
                        style={{ width: "100%", flexWrap: "nowrap" }}
                      >
                        {/* 🔵 BAL: KÉP (50%) */}
                        <Box
                          style={{
                            width: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {loco.image ? (
                            <img
                              src={loco.image}
                              alt={loco.name || "Loco"}
                              style={{
                                height: 48,
                                width: "auto",
                                maxWidth: "100%",
                                objectFit: "contain",
                                display: "block",
                              }}
                            />
                          ) : (
                            <IconPhoto size={24} style={{ opacity: 0.5 }} />
                          )}
                        </Box>

                        {/* 🟢 JOBB: SZÖVEG (50%) */}
                        <Stack
                          gap={2}
                          style={{
                            width: "50%",
                            justifyContent: "center",
                          }}
                        >
                          <Text fw={600} truncate>
                            {loco.name || "Névtelen mozdony"}
                          </Text>

                          <Text size="sm" c="dimmed">
                            Cím: {loco.address}
                          </Text>

                          <Text size="sm" c="dimmed">
                            Max: {loco.maxSpeed}
                          </Text>
                        </Stack>
                      </Group>
                    </Card>))}

                  {locos.length === 0 && (
                    <Text size="sm" c="dimmed">
                      Nincs még mozdony.
                    </Text>
                  )}
                </Stack>
              </ScrollArea>

              <Divider my="sm" />

              <Group grow>
                <Button
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={deleteSelectedLoco}
                  disabled={!selectedLoco}
                >
                  Törlés
                </Button>
              </Group>
            </Card>

            <Card
              withBorder
              radius="sm"
              p="md"
              style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
            >
              {!selectedLoco ? (
                <Stack align="center" justify="center" style={{ flex: 1 }}>
                  <Text fw={600}>Nincs mozdony kiválasztva</Text>
                </Stack>
              ) : (
                <Tabs
                  defaultValue="general"
                  style={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                  <Tabs.List>
                    <Tabs.Tab value="general">General</Tabs.Tab>
                    <Tabs.Tab value="functions">Functions</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="general" pt="md" style={{ flex: 1 }}>
                    <Stack gap="md">
                      <Group align="flex-start" wrap="nowrap">
                        <Card
                          withBorder
                          radius="sm"
                          p="xs"
                          style={{
                            width: 220,
                            height: 160,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {selectedLoco.image ? (
                            <img
                              src={selectedLoco.image}
                              alt={selectedLoco.name}
                              style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          ) : (
                            <Stack align="center" gap="xs">
                              <IconPhoto size={32} />
                              <Text size="sm" c="dimmed">
                                Nincs kép
                              </Text>
                            </Stack>
                          )}
                        </Card>

                        <Stack gap="sm" style={{ flex: 1 }}>
                          <FileButton
                            onChange={setImageFromFile}
                            accept="image/png,image/jpeg,image/webp"
                          >
                            {(props) => (
                              <Button
                                {...props}
                                variant="light"
                                leftSection={<IconPhoto size={16} />}
                              >
                                Kép kiválasztása
                              </Button>
                            )}
                          </FileButton>

                          <Text size="sm" c="dimmed">
                            Most egyelőre Base64-ben mentjük a JSON-be.
                          </Text>
                        </Stack>
                      </Group>

                      <TextInput
                        label="Név"
                        value={selectedLoco.name}
                        onChange={(e) =>
                          updateSelectedLoco({ name: e.currentTarget.value })
                        }
                      />

                      <NumberInput
                        label="Cím"
                        value={selectedLoco.address}
                        min={1}
                        onChange={(value) =>
                          updateSelectedLoco({ address: Number(value) || 0 })
                        }
                      />

                      <NumberInput
                        label="Max sebesség"
                        value={selectedLoco.maxSpeed}
                        min={1}
                        max={1000}
                        onChange={(value) =>
                          updateSelectedLoco({ maxSpeed: Number(value) || 0 })
                        }
                      />

                      <Checkbox
                        label="Invert"
                        checked={selectedLoco.invert}
                        onChange={(e) =>
                          updateSelectedLoco({ invert: e.currentTarget.checked })
                        }
                      />
                    </Stack>
                  </Tabs.Panel>

                  <Tabs.Panel value="functions" pt="md" style={{ flex: 1, minHeight: 0 }}>
                    <Stack gap="md" style={{ height: "100%" }}>
                      <Group justify="space-between">
                        <Text fw={600}>Funkciók</Text>
                        <Button
                          size="xs"
                          leftSection={<IconPlus size={14} />}
                          onClick={addFunction}
                        >
                          Új funkció
                        </Button>
                      </Group>

                      <ScrollArea style={{ flex: 1 }}>
                        <Stack gap="sm">
                          {selectedLoco.functions.map((fn) => (
                            <Card key={fn.id} withBorder radius="sm" p="md">
                              <Group align="flex-start" wrap="nowrap">
                                <NumberInput
                                  label="Szám"
                                  value={fn.number}
                                  min={0}
                                  style={{ width: 120 }}
                                  onChange={(value) =>
                                    updateFunction(fn.id, {
                                      number: Number(value) || 0,
                                    })
                                  }
                                />

                                <TextInput
                                  label="Név"
                                  value={fn.name}
                                  style={{ flex: 1 }}
                                  onChange={(e) =>
                                    updateFunction(fn.id, {
                                      name: e.currentTarget.value,
                                    })
                                  }
                                />

                                <TextInput
                                  label="Ikon"
                                  value={fn.icon}
                                  style={{ width: 100 }}
                                  onChange={(e) =>
                                    updateFunction(fn.id, {
                                      icon: e.currentTarget.value,
                                    })
                                  }
                                />

                                <Checkbox
                                  mt={30}
                                  label="Momentary"
                                  checked={fn.momentary}
                                  onChange={(e) =>
                                    updateFunction(fn.id, {
                                      momentary: e.currentTarget.checked,
                                    })
                                  }
                                />

                                <ActionIcon
                                  mt={28}
                                  color="red"
                                  variant="light"
                                  onClick={() => deleteFunction(fn.id)}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            </Card>
                          ))}

                          {selectedLoco.functions.length === 0 && (
                            <Text size="sm" c="dimmed">
                              Még nincs funkció felvéve.
                            </Text>
                          )}
                        </Stack>
                      </ScrollArea>
                    </Stack>
                  </Tabs.Panel>
                </Tabs>
              )}
            </Card>
          </Group>
        )}

        <Divider my="md" />

        <Group justify="space-between">
          <Text size="sm" c={message.includes("sikerült") ? "green" : "dimmed"}>
            {message || "A módosításokat el tudod menteni a szerverre."}
          </Text>

          <Group>
            {/* <Button variant="default" onClick={onClose}>
              Mégse
            </Button> */}
            <Button onClick={handleSave} loading={saving}>
              Mentés
            </Button>
            <Button variant="light" onClick={onClose}>
              Bezárás
            </Button>

          </Group>
        </Group>
      </Card>
    </Box>
  );
}