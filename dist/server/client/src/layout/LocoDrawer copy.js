import { Card, Drawer, Stack, Text } from "@mantine/core";
export default function LocoDrawer({ opened, onClose }) {
    return (<Drawer opened={opened} onClose={onClose} title="Mozdony drawer" position="left" size="md">
      <Stack gap="sm">
        <Text fw={600}>Mozdonyok</Text>
        <Text size="sm" c="dimmed">
          Ide jön majd a mozdony lista, kiválasztás, sebesség és funkciók kezelése.
        </Text>

        <Card withBorder radius="sm" p="md">
          <Text fw={600}>M61 001</Text>
          <Text size="sm" c="dimmed">
            DCC cím: 3
          </Text>
        </Card>

        <Card withBorder radius="sm" p="md">
          <Text fw={600}>V43 1001</Text>
          <Text size="sm" c="dimmed">
            DCC cím: 12
          </Text>
        </Card>
      </Stack>
    </Drawer>);
}
