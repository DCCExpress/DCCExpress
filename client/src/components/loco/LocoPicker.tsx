import { Button, Card, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type { Loco } from "../../types/loco";
import LocoImage from "./LocoImage";

type LocoPickerProps = {
    opened: boolean;
    locos: Loco[];
    selectedLocoId?: string | undefined;
    title?: string | undefined;
    onClose: () => void;
    onSelect: (loco: Loco) => void;
};

export default function LocoPicker({
    opened,
    locos,
    selectedLocoId,
    title = "Mozdony választó",
    onClose,
    onSelect,
}: LocoPickerProps) {
    if (!opened) return null;

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                padding: 12,
            }}
        >
            <Card
                withBorder
                radius="sm"
                p="md"
                style={{
                    width: "100%",
                    maxWidth: 360,
                    maxHeight: "70vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Group justify="space-between" mb="sm">
                    <Text fw={700}>{title}</Text>
                    <Button
                        size="xs"
                        variant="subtle"
                        leftSection={<IconX size={14} />}
                        onClick={onClose}
                    >
                        Bezárás
                    </Button>
                </Group>

                <ScrollArea style={{ flex: 1 }}>
                    <Stack gap="sm">
                        {locos.map((loco) => (
                            <Card
                                key={loco.id}
                                withBorder
                                radius="sm"
                                p="sm"
                                style={{
                                    cursor: "pointer",
                                    borderColor:
                                        loco.id === selectedLocoId
                                            ? "var(--mantine-color-blue-5)"
                                            : undefined,
                                }}
                                onClick={() => onSelect(loco)}
                            >
                                <Group wrap="nowrap">
                                    <LocoImage
                                        image={loco.image}
                                        name={loco.name}
                                        width={120}
                                        height={60}
                                    />

                                    <div>
                                        <Text fw={600}>{loco.name || "Névtelen mozdony"}</Text>
                                        <Text size="sm" c="dimmed">
                                            DCC cím: {loco.address}
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            Max seb.: {loco.maxSpeed}
                                        </Text>
                                    </div>
                                </Group>
                            </Card>
                        ))}

                        {locos.length === 0 && (
                            <Text size="sm" c="dimmed">
                                Nincs választható mozdony.
                            </Text>
                        )}
                    </Stack>
                </ScrollArea>
            </Card>
        </div>
    );
}