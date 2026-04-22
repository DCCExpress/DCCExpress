import { NavLink, Stack } from "@mantine/core";
import {
  IconAntennaBars5,
  IconCpu,
  IconHome,
  IconMap2,
  IconRoute,
  IconSettings,
  IconSwitch2,
  IconTrain,
} from "@tabler/icons-react";

type LeftMenuProps = {
  onGoHome: () => void;
  onOpenLocos: () => void;
};


export default function LeftMenu({ onGoHome, onOpenLocos }: LeftMenuProps)  {
  return (
    <Stack gap="xs">
      <NavLink
        label="Főoldal"
        leftSection={<IconHome size={16} />}
        onClick={onGoHome}
      />
      <NavLink label="Pálya" leftSection={<IconMap2 size={16} />} active />
        <NavLink
        label="Mozdonyok"
        leftSection={<IconTrain size={16} />}
        onClick={onOpenLocos}
      />
      <NavLink label="Útvonalak" leftSection={<IconRoute size={16} />} />
      <NavLink label="Váltók" leftSection={<IconSwitch2 size={16} />} />
      <NavLink label="Parancsközpont" leftSection={<IconCpu size={16} />} />
      <NavLink label="Diagnosztika" leftSection={<IconAntennaBars5 size={16} />} />
      <NavLink label="Beállítások" leftSection={<IconSettings size={16} />} />
    </Stack>
  );
}