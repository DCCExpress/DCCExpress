import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Menu,
  Modal,
  Switch,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconEdit,
  IconEditFilled,
  IconHome,
  IconMaximize,
  IconMoon,
  IconPointer,
  IconSettings,
  IconSun,
  IconTopologyStar3,
  IconTrash,
} from "@tabler/icons-react";
import TrainIcon from "../icons/TrainIcon";
import { EditorTool } from "../models/editor/types/EditorTypes";
import { useState } from "react";
import "../styles/help.css";
import { useWsStatus } from "../hooks/useWsStatus";
import { useTranslation } from "react-i18next";
import { isTouchDevice } from "../helpers";

export function getWsColor(status: string) {
  switch (status) {
    case "connected":
      return "green";
    case "connecting":
    case "reconnecting":
      return "yellow";
    case "error":
      return "red";
    default:
      return "gray";
  }
}

type TopMenuBarProps = {
  editMode: boolean;
  onEditModeChange: (value: boolean) => void;
  onGoHome: () => void;
  onOpenLocos: () => void;
  locoPanelCollapsed: boolean;
  onToggleLocoPanel: () => void;
  propertyPanelCollapsed: boolean;
  onTogglePropertyPanel: () => void;
  tool: EditorTool;
  onCursorToolClick: () => void;
  onOpenElementPicker: () => void;
  onSaveLayout: () => void;
  onLoadLayout: () => void;

  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSettingsClick: () => void;
  onDeleteToolClick: () => void;
  onFitLayout: () => void;
  onOpenCommandCenterDialog: () => void;
};

export default function TopMenuBar({
  editMode,
  onEditModeChange,
  onGoHome,
  onOpenLocos,
  locoPanelCollapsed,
  onToggleLocoPanel,
  propertyPanelCollapsed,
  onTogglePropertyPanel,
  tool,
  onCursorToolClick,
  onOpenElementPicker,
  onSaveLayout,
  onLoadLayout,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSettingsClick,
  onDeleteToolClick,
  onFitLayout,
  onOpenCommandCenterDialog,
}: TopMenuBarProps) {

  const { t } = useTranslation();

  const [helpOpened, setHelpOpened] = useState(false);
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const touchOnly = isTouchDevice();
  //const wsStatus = useWsStatus();


  return (
    <Group ml={22} h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        {/* <ThemeIcon size="lg" radius="sm" variant="light">
          <TrainIcon size={18} />
        </ThemeIcon> */}

        {/* <Badge color={getWsColor(wsStatus)} variant="filled">
          WS: {wsStatus}
        </Badge> */}

        <Tooltip label={t("Home")} withArrow position="bottom">
          <ActionIcon
            size="lg"
            radius="sm"
            variant="light"
            onClick={onGoHome}
            onMouseDown={(e) => e.preventDefault()}
            aria-label={t("Home")}
          >
            <IconHome size={18} />
          </ActionIcon>
        </Tooltip>

        <Text fw={700}>DCCExpress</Text>

        {/* <Button variant="subtle" size="xs" onClick={onGoHome}>
          {t("Home")}
        </Button> */}

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button variant="subtle" size="xs">
              {t("File")}
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item onClick={onLoadLayout}>{t("Load")}</Menu.Item>

            <Menu.Item
              onClick={async () => {
                try {
                  await Promise.resolve(onSaveLayout());
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              <Group justify="space-between" w="100%">
                <Text>{t("Save")}</Text>
                <Text c="dimmed" size="xs">
                  Ctrl + S
                </Text>
              </Group>
            </Menu.Item>
            <Divider />
            <Menu.Item onClick={onGoHome}>{t("Home")}</Menu.Item>


          </Menu.Dropdown>
        </Menu>

        <Menu>
          <Menu.Target>
            <Button variant="subtle" size="xs">
              {t("Railway")}
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item onClick={onOpenLocos}>{t("Locomotives") + "..."}</Menu.Item>
            <Menu.Item disabled onClick={onOpenLocos}>{t("Trains" + "...")}</Menu.Item>
            <Menu.Item disabled onClick={onOpenLocos}>{t("Routes") + "..."}</Menu.Item>
          </Menu.Dropdown>
        </Menu>

        {/* <Button variant="subtle" size="xs">
          Pálya
        </Button> */}

        {/* <Button variant="subtle" size="xs">
          Route
        </Button> */}

        {/* <Button variant="subtle" size="xs">
          Váltók
        </Button> */}

        {/* <Button variant="subtle" size="xs">
          Parancsközpont
        </Button> */}

        {/* <Button variant="subtle" size="xs">
          Diagnosztika
        </Button> */}

        {/* <Button variant="subtle" size="xs" onClick={() => onSettingsClick()}>
          {t("Settings")}
        </Button> */}

        <Menu>
          <Menu.Target>
            <Button variant="subtle" size="xs">
              {t("Settings")}
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item onClick={onSettingsClick}>{t("UI") + "..."}</Menu.Item>
            <Menu.Item onClick={onOpenCommandCenterDialog}>{t("CommandCenter") + "..."}</Menu.Item>
          </Menu.Dropdown>
        </Menu>


        <Button variant="subtle" size="xs" onClick={() => setHelpOpened(true)}>
          {t("Help")}
        </Button>

        <Modal
          opened={helpOpened}
          onClose={() => setHelpOpened(false)}
          title={t("Quick help")}
          size="xl"
          centered
        >
          <iframe
            src="/quickhelp.html"
            title="Quick Help"
            className="help-iframe"
          />
        </Modal>

        {/* <Switch
          title="Szerk"
          checked={editMode}
          onChange={(e) => onEditModeChange(e.currentTarget.checked)}
          label="Szerkesztés"
        /> */}

        <Tooltip label="Edit mode (E)">
          <ActionIcon
            variant={editMode ? "filled" : "light"}
            //onClick={onOpenElementPicker}

            disabled={touchOnly}
            color="#7B2EDA"
            onClick={(e) => onEditModeChange(!editMode)}

            onMouseDown={(e) => e.preventDefault()}
          >
            <IconEditFilled size={18} />
          </ActionIcon>
        </Tooltip>

        <Divider orientation="vertical" size="sm" mr={4} ml={4} />

        <Tooltip label="Fit layout (F)">
          <ActionIcon
            variant="light"
            color="blue"
            onClick={onFitLayout}
            onMouseDown={(e) => e.preventDefault()}
            aria-label="Fit layout"
          >
            <IconMaximize size={18} />
          </ActionIcon>
        </Tooltip>


        {editMode && (


          <Group gap={6} wrap="nowrap">
            <Divider orientation="vertical" size="sm" mr={4} ml={4} />
            <Tooltip label="Cursor (Esc)">
              <ActionIcon
                variant={tool.mode === "cursor" ? "filled" : "light"}
                onClick={onCursorToolClick}
                onMouseDown={(e) => e.preventDefault()}
                aria-label="Cursor mode"
              >
                <IconPointer size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Elements">
              <ActionIcon
                variant={tool.mode === "draw" ? "filled" : "light"}
                onClick={onOpenElementPicker}
                onMouseDown={(e) => e.preventDefault()}
                aria-label="Elemement"
              >
                <IconTopologyStar3 size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={t("Delete (Del)")}>
              <ActionIcon
                variant={tool.mode === "delete" ? "filled" : "light"}
                onClick={onDeleteToolClick}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={t("Delete")}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Tooltip>


            <Divider orientation="vertical" size="sm" mr={4} ml={4} />

            <Tooltip label="Undo (Ctrl+Z)">
              <ActionIcon
                variant="light"
                onClick={onUndo}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={t("Undo")}
                disabled={!canUndo}
              >
                <IconArrowBackUp size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Redo (Ctrl+Y / Ctrl+Shift+Z)">
              <ActionIcon
                variant="light"
                onClick={onRedo}
                onMouseDown={(e) => e.preventDefault()}
                aria-label="Redo"
                disabled={!canRedo}
              >
                <IconArrowForwardUp size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Group>

      <Group gap="sm" wrap="nowrap">
        <ActionIcon
          variant="subtle"
          onClick={() =>
            setColorScheme(colorScheme === "dark" ? "light" : "dark")
          }
          aria-label="Theme toggle"
        >
          {colorScheme === "dark" ? (
            <IconSun size={18} />
          ) : (
            <IconMoon size={18} />
          )}
        </ActionIcon>

        <Tooltip
          label={locoPanelCollapsed ? "Loco panel mutatása" : "Loco panel elrejtése"}
          withArrow
          position="bottom"
        >
          <ActionIcon variant="light" size="lg" onClick={onToggleLocoPanel}>
            <TrainIcon size={24} />
          </ActionIcon>
        </Tooltip>

        <Tooltip
          label={
            propertyPanelCollapsed
              ? "Property panel mutatása"
              : "Property panel elrejtése"
          }
          withArrow
          position="bottom"
        >
          <ActionIcon
            variant={propertyPanelCollapsed ? "light" : "filled"}
            size="sm"
            onClick={onTogglePropertyPanel}
          >
            <IconSettings size={16} />
          </ActionIcon>
        </Tooltip>

      </Group>
    </Group>
  );
}