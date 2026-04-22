import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconPointer, IconShape } from "@tabler/icons-react";
import { EditorTool } from "../../models/editor/types/EditorTypes";

type EditorToolbarProps = {
  tool: EditorTool;
  onCursorClick: () => void;
  onElementsClick: () => void;
};

export default function EditorToolbar({
  tool,
  onCursorClick,
  onElementsClick,
}: EditorToolbarProps) {
  const isCursorActive = tool.mode === "cursor";
  const isDrawActive = tool.mode === "draw";

  return (
    <Group gap="xs">
      <Tooltip label="Kurzor (Esc)">
        <ActionIcon
          size="lg"
          variant={isCursorActive ? "filled" : "light"}
          onClick={onCursorClick}
          aria-label="Kurzor mód"
        >
          <IconPointer size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Elem kiválasztása">
        <ActionIcon
          size="lg"
          variant={isDrawActive ? "filled" : "light"}
          onClick={onElementsClick}
          aria-label="Elem kiválasztása"
        >
          <IconShape size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}