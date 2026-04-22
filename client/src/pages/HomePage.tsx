import {
  AppShell,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAntennaBars5,
  IconMap2,
  IconTrain,
} from "@tabler/icons-react";

type HomePageProps = {
  onOpenLayout: () => void;
};

export default function HomePage({ onOpenLayout }: HomePageProps) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="sm" variant="light">
              <IconTrain size={18} />
            </ThemeIcon>

            <div>
              <Text fw={700}>DCCExpress</Text>
              <Text size="xs" c="dimmed">
                Vasútmodell vezérlő
              </Text>
            </div>
          </Group>

          <Group gap="sm">
            <Badge color="green" variant="light">
              Server OK
            </Badge>
            <Badge color="blue" variant="light">
              WS Ready
            </Badge>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Stack gap="xl">
          <Box>
            <Title order={1}>Főoldal</Title>
            <Text c="dimmed" mt="xs">
              Innen tudsz tovább lépni a pálya nézetre, ahol a középső rész lesz
              a pálya, jobb oldalon a tulajdonság panel, bal oldalon a menü és
              a mozdony drawer.
            </Text>
          </Box>

          <Card withBorder radius="lg" p="xl">
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={3}>Pálya kezelő</Title>
                  <Text c="dimmed" size="sm" mt={4}>
                    A fő munkafelület, ahol nézni és szerkeszteni tudod majd a
                    vasúti pályát.
                  </Text>
                </div>

                <ThemeIcon size="xl" radius="sm" variant="light">
                  <IconMap2 size={24} />
                </ThemeIcon>
              </Group>

              <Group>
                <Button leftSection={<IconMap2 size={16} />} onClick={onOpenLayout}>
                  Belépés a pályára
                </Button>
              </Group>
            </Stack>
          </Card>

          <Card withBorder radius="lg" p="lg">
            <Group gap="sm">
              <ThemeIcon variant="light">
                <IconAntennaBars5 size={16} />
              </ThemeIcon>
              <Text size="sm" c="dimmed">
                Később ide jöhetnek gyors státuszok, legutóbbi projekt, központ
                kapcsolat, WS kapcsolat és hasonlók.
              </Text>
            </Group>
          </Card>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}