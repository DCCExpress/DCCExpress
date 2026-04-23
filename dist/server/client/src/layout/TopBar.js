// import {
//   ActionIcon,
//   Badge,
//   Burger,
//   Group,
//   Switch,
//   Text,
//   ThemeIcon,
//   useMantineColorScheme,
// } from "@mantine/core";
// import { IconMoon, IconSun, IconTrain } from "@tabler/icons-react";
export {};
// type TopBarProps = {
//   editMode: boolean;
//   onEditModeChange: (value: boolean) => void;
//   onToggleDrawer: () => void;
// };
// export default function TopBar({
//   editMode,
//   onEditModeChange,
//   onToggleDrawer,
// }: TopBarProps) {
//   const { colorScheme, setColorScheme } = useMantineColorScheme();
//   const toggleTheme = () => {
//     setColorScheme(colorScheme === "dark" ? "light" : "dark");
//   };
//   return (
//     <Group h="100%" px="md" justify="space-between">
//       <Group gap="sm">
//         <Burger opened={false} onClick={onToggleDrawer} size="sm" />
//         <ThemeIcon size="lg" radius="sm" variant="light">
//           <IconTrain size={18} />
//         </ThemeIcon>
//         <div>
//           <Text fw={700}>DCCExpress</Text>
//           <Text size="xs" c="dimmed">
//             Pálya nézet
//           </Text>
//         </div>
//       </Group>
//       <Group gap="sm">
//         <ActionIcon variant="light" size="lg" onClick={toggleTheme}>
//           {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
//         </ActionIcon>
//         <Switch
//           checked={editMode}
//           onChange={(e) => onEditModeChange(e.currentTarget.checked)}
//           label="Szerkesztés"
//         />
//         <Badge color={editMode ? "orange" : "blue"} variant="light">
//           {editMode ? "Edit Mode" : "View Mode"}
//         </Badge>
//       </Group>
//     </Group>
//   );
// }
