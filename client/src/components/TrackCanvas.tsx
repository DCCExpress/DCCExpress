import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Box, Group, Popover, Text, Stack, useMantineColorScheme } from "@mantine/core";
import { BaseElement } from "../models/editor/core/BaseElement";
import { DrawOptions, ELEMENT_TYPES, EditorTool } from "../models/editor/types/EditorTypes";
import { TrackElement } from "../models/editor/elements/TrackElement";
import { TrackEndElement } from "../models/editor/elements/TrackEndElement";
import { TrackCornerElement } from "../models/editor/elements/TrackCornerElement";
import { TrackCurveElement } from "../models/editor/elements/TrackCurveElement";
import { TrackTurnoutLeftElement } from "../models/editor/elements/TrackTurnoutLeftElement";
import { TrackTurnoutRightElement } from "../models/editor/elements/TrackTurnoutRightElement";
import { generateId, showErrorMessage, showWarningMessage, sleep } from "../helpers";
import { isTurnoutElement, Layout } from "../models/editor/core/Layout";

import "../styles/TrackCanvas.css";
import { TrackTurnoutTwoWayElement } from "../models/editor/elements/TrackTurnoutTwoWayElement";
import TrackTurnoutDoubleElement from "../models/editor/elements/TrackTurnoutDoubleElement";
import { TrackSensorElement } from "../models/editor/elements/TrackSensorElement";
import { ButtonElement } from "../models/editor/elements/ButtonElement";
import { ClockElement } from "../models/editor/elements/ClockElement";
import { TreeElement } from "../models/editor/elements/TreeElement";
import { BlockElement } from "../models/editor/elements/BlockElement";
import { TrackSignalElement } from "../models/editor/elements/TrackSignalElement";
import { AudioButtonElement } from "../models/editor/elements/AudioButtonElement";
import { RouteButtonElement, RouteTurnoutItem } from "../models/editor/elements/RouteButtonElement";
import { TrackCrossingElement } from "../models/editor/elements/TrackCrossingElement";
import { ClickableBaseElement } from "../models/editor/core/ClickableBaseElement";
import { EditorSettings, useEditorSettings } from "../context/EditorSettingsContext";
import ElementPreview from "../models/editor/rendering/ElementPreviewRenderer";
import { wsApi } from "../services/wsApi";
import { TrackTurnoutElement } from "../models/editor/elements/TrackTurnoutElement";
import { useCommandCenter } from "../context/CommandCenterContext";
import { is } from "zod/v4/locales/index.js";

type TrackCanvasProps = {
  editMode?: boolean;
  tool: EditorTool;
  layout: Layout;
  onLayoutChange: Dispatch<SetStateAction<Layout>>;
  onBeforeLayoutChange?: () => void;
  selectedElement: BaseElement | null;
  onSelectedElementChange: (element: BaseElement | null) => void;
  invaildateCounter: number;
  onInvalidate: () => void;
  fitCounter: number;
  turnoutSelectionMode: boolean;
  setBusy?: (busy: boolean, text?: string) => void;
};

type ViewState = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

type PanState = {
  isPanning: boolean;
  lastX: number;
  lastY: number;
};

type DragState = {
  isDraggingElement: boolean;
  elementId: string | null;
  startMouseGridX: number;
  startMouseGridY: number;
  startElementX: number;
  startElementY: number;
  draggedElements: Array<{
    id: string;
    startX: number;
    startY: number;
  }>;
};

type PointerPanState = {
  activePointerId: number | null;
  isTouchPanning: boolean;
};

type TouchPoint = {
  x: number;
  y: number;
};

type PinchState = {
  isPinching: boolean;
  pointer1Id: number | null;
  pointer2Id: number | null;
  startDistance: number;
  startScale: number;
  worldCenterX: number;
  worldCenterY: number;
};

type CanvasSize = {
  width: number;
  height: number;
};

type SelectionRect = {
  startGridX: number;
  startGridY: number;
  endGridX: number;
  endGridY: number;
};

type SelectionState = {
  isSelecting: boolean;
  additive: boolean;
  startGridX: number;
  startGridY: number;
  endGridX: number;
  endGridY: number;
};

const CursorTrackElement = new TrackElement(0, 0);
const CursorTrackEndElement = new TrackEndElement(0, 0);
const CursorTrackCornerElement = new TrackCornerElement(0, 0);
const CursorTrackCurveElement = new TrackCurveElement(0, 0);
const CursorTrackTurnoutLeftElement = new TrackTurnoutLeftElement(0, 0);
const CursorTrackTurnoutRightElement = new TrackTurnoutRightElement(0, 0);
const CursorTrackTurnoutTwoWayElement = new TrackTurnoutTwoWayElement(0, 0);
const CursorTrackTurnoutDoubleElement = new TrackTurnoutDoubleElement(0, 0);
const CursorTrackSensorElement = new TrackSensorElement(0, 0);
const CursorTrackSignal2Element = new TrackSignalElement(0, 0);
CursorTrackSignal2Element.aspect = 2;
const CursorTrackSignal3Element = new TrackSignalElement(0, 0);
CursorTrackSignal3Element.aspect = 3;
const CursorTrackSignal4Element = new TrackSignalElement(0, 0);
CursorTrackSignal4Element.aspect = 4;
const CursorTrackCrossingElement = new TrackCrossingElement(0, 0);
const CursorButtonElement = new ButtonElement(0, 0);
const CursorRouteButtonElement = new RouteButtonElement(0, 0);
const CursorAudioButtonElement = new AudioButtonElement(0, 0);
const CursorClockElement = new ClockElement(0, 0);
const CursorTreeElement = new TreeElement(0, 0);
const CursorBlockElement = new BlockElement(0, 0);

// const PreviewSignal1 = new TrackSignalElement(0, 0);
// PreviewSignal1.setGreen();
// const PreviewSignal2 = new TrackSignalElement(0, 0);
// PreviewSignal2.setRed();
// const PreviewSignal3 = new TrackSignalElement(0, 0);
// PreviewSignal3.setYellow();
// const PreviewSignal4 = new TrackSignalElement(0, 0);
// PreviewSignal4.setWhite();



const VIEW_STORAGE_KEY = "dcc-express.editor.trackCanvas.view";

function loadSavedViewState(): ViewState {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY);
    if (!raw) {
      return {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      };
    }

    const parsed = JSON.parse(raw) as Partial<ViewState>;

    return {
      scale:
        typeof parsed.scale === "number" && Number.isFinite(parsed.scale)
          ? clamp(parsed.scale, 0.2, 4)
          : 1,
      offsetX:
        typeof parsed.offsetX === "number" && Number.isFinite(parsed.offsetX)
          ? parsed.offsetX
          : 0,
      offsetY:
        typeof parsed.offsetY === "number" && Number.isFinite(parsed.offsetY)
          ? parsed.offsetY
          : 0,
    };
  } catch {
    return {
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    };
  }
}

function saveViewState(view: ViewState): void {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(view));
  } catch {
    // ignore
  }
}

type SignalAspectValue = 1 | 2 | 3 | 4;

type SignalAspectPopoverState = {
  opened: boolean;
  x: number;
  y: number;
  signal: TrackSignalElement | null;
  previews: {
    green: TrackSignalElement;
    red: TrackSignalElement;
    yellow: TrackSignalElement;
    white: TrackSignalElement;
  } | null;
};

export default function TrackCanvas({
  editMode = false,
  tool,
  layout,
  onLayoutChange,
  onBeforeLayoutChange,
  selectedElement,
  onSelectedElementChange,
  invaildateCounter,
  onInvalidate,
  fitCounter,
  turnoutSelectionMode,
  setBusy
}: TrackCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { colorScheme } = useMantineColorScheme();

  const [mouseGrid, setMouseGrid] = useState({ x: 0, y: 0 });
  const [hoverGrid, setHoverGrid] = useState<{ x: number; y: number } | null>(null);
  const [currentCursor, setCurrentCursor] = useState<BaseElement | null>(null);
  const [drawVersion, setDrawVersion] = useState(0);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 0, height: 0, });

  const turnoutSelectionModeRef = useRef(false);

  const touchPointsRef = useRef<Map<number, TouchPoint>>(new Map());
  const viewRef = useRef<ViewState>(loadSavedViewState());
  const panRef = useRef<PanState>({
    isPanning: false,
    lastX: 0,
    lastY: 0,
  });
  const dragRef = useRef<DragState>({
    isDraggingElement: false,
    elementId: null,
    startMouseGridX: 0,
    startMouseGridY: 0,
    startElementX: 0,
    startElementY: 0,
    draggedElements: [],
  });

  const selectionRef = useRef<SelectionState>({
    isSelecting: false,
    additive: false,
    startGridX: 0,
    startGridY: 0,
    endGridX: 0,
    endGridY: 0,
  });

  const pointerPanRef = useRef<PointerPanState>({
    activePointerId: null,
    isTouchPanning: false,
  });

  const pinchRef = useRef<PinchState>({
    isPinching: false,
    pointer1Id: null,
    pointer2Id: null,
    startDistance: 0,
    startScale: 1,
    worldCenterX: 0,
    worldCenterY: 0,
  });
  const prevToolRef = useRef<EditorTool | null>(null);

  const layoutRef = useRef(layout);
  const toolRef = useRef(tool);
  const editModeRef = useRef(editMode);
  const selectedElementRef = useRef<BaseElement | null>(selectedElement);
  const currentCursorRef = useRef<BaseElement | null>(currentCursor);

  const [signalAspectPopover, setSignalAspectPopover] =
    useState<SignalAspectPopoverState>({
      opened: false,
      x: 0,
      y: 0,
      signal: null,
      previews: null,
    });

  const signalAspectPopoverRef = useRef(signalAspectPopover);
  useEffect(() => {
    signalAspectPopoverRef.current = signalAspectPopover;
  }, [signalAspectPopover]);

  const invalidate = () => {
    setDrawVersion((prev) => prev + 1);
  };


  const commandCenter = useCommandCenter();
  const commandCenterRef = useRef(commandCenter);

  useEffect(() => {
    commandCenterRef.current = commandCenter;
  }, [commandCenter]);


  useEffect(() => {
    invalidate();
  }, [invaildateCounter]);

  const { settings } = useEditorSettings();
  // useEffect(() => {
  //   alert("OK" + settings.showAddress)
  // }, [settings])

  const persistView = () => {
    saveViewState(viewRef.current);
  };

  useEffect(() => {
    layoutRef.current = layout;
    onSelectedElementChange(null);
    layout.unselectAll();
  }, [layout]);

  useEffect(() => {
    toolRef.current = tool;
    layout.unselectAll();
    setHoverGrid(null);
  }, [tool]);

  useEffect(() => {
    editModeRef.current = editMode;
    setHoverGrid(null);
  }, [editMode]);

  useEffect(() => {

    if(selectedElementRef.current && selectedElementRef.current instanceof RouteButtonElement){
      if(layoutRef.current){
        const elems = layoutRef.current.getAllElements();
        elems.forEach(elem => { elem.marked = false; })
      }
    }

    selectedElementRef.current = selectedElement;
    setHoverGrid(null);
  }, [selectedElement]);

  useEffect(() => {
    currentCursorRef.current = currentCursor;
  }, [currentCursor]);

  useEffect(() => {
    if (fitCounter === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    fitLayoutToView(layoutRef.current, viewRef.current, width, height);
    persistView();
    invalidate();
  }, [fitCounter]);

  useEffect(() => {
    if (selectedElement) {
      layout.setSelected(selectedElement);
    } else {
      // csak akkor unselectelünk, ha tényleg nincs több kijelölt elem
      const hasAnySelected = getAllLayoutElements(layout).some((el) => el.selected);
      if (!hasAnySelected) {
        layout.unselectAll();
      }
    }

    invalidate();


  }, [selectedElement, layout]);

  useEffect(() => {
    onSelectedElementChange(null);
    prevToolRef.current = tool;
  }, [tool]);

  useEffect(() => {
    if (tool.mode !== "draw") {
      setCurrentCursor(null);
      layoutRef.current.unselectAll();
      return;
    }

    const cursor = createCursorElement(tool);
    cursor!.selected = true;
    canvasRef.current?.focus();
    setCurrentCursor(cursor);
  }, [tool]);

  useEffect(() => {
    if (editMode && signalAspectPopoverRef.current.opened) {
      closeSignalAspectPopover();
    }
    invalidate();
  }, [layout, colorScheme, tool, mouseGrid, hoverGrid, editMode, currentCursor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.focus();

    const parent = canvas.parentElement;
    if (!parent) return;

    const updateSize = () => {
      setCanvasSize({
        width: parent.clientWidth,
        height: parent.clientHeight,
      });
    };

    updateSize();

    const ro = new ResizeObserver(() => {
      if (signalAspectPopoverRef.current.opened) {
        closeSignalAspectPopover();
      }
      updateSize();
    });

    ro.observe(parent);

    return () => {
      ro.disconnect();
    };
  }, []);

  const setRouteTurnoutsMarked = (rb: RouteButtonElement) => {
    const elems = layoutRef.current.getAllElements();
    for (const elem of elems) {
      if (elem instanceof TrackTurnoutElement) {
        const found = rb.routeTurnouts.find((e) => e.turnoutId === elem.id);
        if (found) {
          elem.marked = true;
        } else {
          elem.marked = false;
        }
      }
    }
    invalidate();
  };

  useEffect(() => {

    turnoutSelectionModeRef.current = turnoutSelectionMode;

    if (layoutRef.current) {
      const elems = layoutRef.current.getAllElements();
      if (turnoutSelectionMode) {
        for (const elem of elems) {
          if (elem instanceof TrackTurnoutLeftElement || elem instanceof TrackTurnoutRightElement) {
            elem.enabled = true;
          } else {
            elem.enabled = false;
          }
        }

        setRouteTurnoutsMarked(selectedElementRef.current as RouteButtonElement);

      } else {
        for (const elem of elems) {
          elem.enabled = true;
          elem.marked = false;
        }
      }
    }



  }, [turnoutSelectionMode])


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvasSize.width <= 0 || canvasSize.height <= 0) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(canvasSize.width * dpr);
    canvas.height = Math.floor(canvasSize.height * dpr);
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);


    //if(turnoutSelectionModeRef.current){
      if(selectedElementRef.current instanceof RouteButtonElement){
        setRouteTurnoutsMarked(selectedElementRef.current as RouteButtonElement);
      }
    //}


    drawScene(
      ctx,
      canvasSize.width,
      canvasSize.height,
      editMode,
      colorScheme,
      viewRef.current,
      mouseGrid,
      tool,
      hoverGrid,
      currentCursor,
      layout,
      settings,
      dragRef.current.elementId ?? undefined,
      selectedElement ?? undefined,
      getSelectionRect(selectionRef.current),
      turnoutSelectionMode
    );
  }, [canvasSize, editMode, colorScheme, mouseGrid, tool, hoverGrid, currentCursor, layout, drawVersion, selectedElement, settings, turnoutSelectionMode]);



  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (ev: WheelEvent) => {
      ev.preventDefault();

      if (signalAspectPopoverRef.current.opened) {
        closeSignalAspectPopover();
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = ev.clientX - rect.left;
      const mouseY = ev.clientY - rect.top;

      const zoomFactor = ev.deltaY < 0 ? 1.1 : 0.9;
      const oldScale = viewRef.current.scale;
      const newScale = clamp(oldScale * zoomFactor, 0.2, 4);

      if (newScale === oldScale) return;

      const worldX = (mouseX - viewRef.current.offsetX) / oldScale;
      const worldY = (mouseY - viewRef.current.offsetY) / oldScale;

      viewRef.current.scale = newScale;
      viewRef.current.offsetX = mouseX - worldX * newScale;
      viewRef.current.offsetY = mouseY - worldY * newScale;

      persistView();
      invalidate();
    };

    const reopenSignalAspectPopover = (
      signal: TrackSignalElement,
      clientX: number,
      clientY: number
    ) => {
      closeSignalAspectPopover();

      window.setTimeout(() => {
        openSignalAspectPopover(signal, clientX, clientY);
      }, 100);
    };


    const executeRoute = async function (rb: RouteButtonElement) {

      if (commandCenterRef.current.locked) {
        showWarningMessage(
          "Warning",
          "Command center is busy. Route cannot be started."
        );
        return;
      }

      const elems = layoutRef.current.getAllElements();
      wsApi.routeLock();
      setBusy?.(true, "Route is being set...");
      await sleep(500);
      try {
        for (const ri of rb.routeTurnouts) {
          const t = elems.find((elem) => ri.turnoutId === elem.id) as TrackTurnoutElement;

          if (
            t instanceof TrackTurnoutLeftElement ||
            t instanceof TrackTurnoutRightElement ||
            t instanceof TrackTurnoutTwoWayElement ||
            t instanceof TrackTurnoutDoubleElement
          ) {
            wsApi.setTurnout(
              t.turnoutAddress,
              ri.closed === t.turnoutClosedValue
            );

            await sleep(1500);
          }
        }
      } finally {
        wsApi.routeUnlock();
        setBusy?.(false);
      }
    }

    const handleClickableDown = (
      hitElement: BaseElement | null,
      ev: MouseEvent | PointerEvent
    ): boolean => {
      if (!hitElement) return false;
      if (!(hitElement instanceof ClickableBaseElement)) return false;

      if (hitElement instanceof RouteButtonElement) {
        void executeRoute(hitElement);
        return true;
      }

      hitElement.mouseDown(ev as any);
      return true;
    };

    const handleClickableUp = (
      hitElement: BaseElement | null,
      ev: MouseEvent | PointerEvent
    ): boolean => {
      if (!hitElement) return false;
      if (!(hitElement instanceof ClickableBaseElement)) return false;

      hitElement.mouseUp(ev as any);
      return true;
    };

    const handleMouseDown = (ev: MouseEvent) => {
      const currentLayout = layoutRef.current;
      const currentTool = toolRef.current;
      const currentEditMode = editModeRef.current;
      const currentTurnouSelection = turnoutSelectionModeRef.current;
      const currentElement = selectedElementRef.current;
      //if (ev.button !== 0 && ev.button !== 1) return;

      // Canvas mozgatása
      if (ev.button === 2) {
        ev.preventDefault();
        if (signalAspectPopoverRef.current.opened) {
          closeSignalAspectPopover();
        }

        panRef.current.isPanning = true;
        panRef.current.lastX = ev.clientX;
        panRef.current.lastY = ev.clientY;
        canvas.style.cursor = "grabbing";
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = ev.clientX - rect.left;
      const mouseY = ev.clientY - rect.top;

      const grid = screenToGrid(
        mouseX,
        mouseY,
        viewRef.current,
        currentLayout.gridSize
      );

      const hitElement = currentLayout.getElement(grid.x, grid.y);


      if (currentEditMode) {
        if (currentTurnouSelection) {
          if (hitElement) {


            if (currentElement instanceof RouteButtonElement) {
              if (isTurnoutElement(hitElement)) {
                const rb = currentElement as RouteButtonElement;
                const t = hitElement as TrackTurnoutElement;
                const closed = t.turnoutClosed == t.turnoutClosedValue;
                rb.addOrUpdateTurnout(hitElement.id, closed);
                setRouteTurnoutsMarked(selectedElementRef.current as RouteButtonElement);
                onInvalidate();
              }
            } else {
              alert("Nincs aktív RouteButton")
            }

            return;
          }
          return;
        }
      }

      if (!editModeRef.current) {
        if (hitElement instanceof TrackSignalElement) {
          if (signalAspectPopoverRef.current.opened) {
            reopenSignalAspectPopover(hitElement, ev.clientX, ev.clientY);
          } else {
            openSignalAspectPopover(hitElement, ev.clientX, ev.clientY);
          }

          return;
        }
      }
      if (signalAspectPopoverRef.current.opened) {
        closeSignalAspectPopover();
      }

      // A klikkelést lehet csak Control módban kellene engedélyezni!
      // if (toolRef.current.mode == "cursor" && hitElement && !editModeRef.current) {
      //   if (hitElement instanceof ClickableBaseElement) {
      //     if (hitElement instanceof RouteButtonElement) {
      //       const rb = hitElement as RouteButtonElement;
      //       const elems = currentLayout.getAllElements();

      //       //setBusy?.(true, "Route is being set...");
      //       executeRoute(rb)

      //     } else {
      //       const elem = hitElement as ClickableBaseElement
      //       elem.mouseDown(ev);
      //     }
      //   }
      // }
      if (toolRef.current.mode === "cursor" && !editModeRef.current) {
        if (handleClickableDown(hitElement, ev)) {
          return;
        }
      }

      if (!currentEditMode) return;

      if (currentTool.mode === "delete") {
        const elem = currentLayout.getElement(grid.x, grid.y);
        if (elem) {
          onBeforeLayoutChange?.();
          currentLayout.removeElement(elem);
          onLayoutChange((prev) => prev);
          invalidate();
        }
        return;
      }

      if (currentTool.mode === "draw") {
        const cursor = currentCursorRef.current;
        if (!cursor) return;

        const exists = currentLayout.getLayeredElement(cursor, grid.x, grid.y);
        if (exists) {
          showErrorMessage("Error", "Already has an element!");
          return;
        }

        onBeforeLayoutChange?.();

        const newElement = cursor.clone();
        newElement.id = generateId();
        newElement.x = grid.x;
        newElement.y = grid.y;
        newElement.selected = false;

        switch (newElement.layerName) {
          case "blocks":
            currentLayout.blocks.elements.push(newElement);
            break;
          case "signals":
            currentLayout.signals.elements.push(newElement);
            break;
          case "sensors":
            currentLayout.sensors.elements.push(newElement);
            break;
          case "track":
            currentLayout.track.elements.push(newElement);
            break;
          case "buildings":
            currentLayout.buildings.elements.push(newElement);
            break;
        }

        onLayoutChange((prev) => prev);
        invalidate();
        return;
      }

      if (hitElement) {
        if (ev.ctrlKey) {
          hitElement.selected = !hitElement.selected;

          const allSelected = getAllLayoutElements(currentLayout).filter(
            (el) => el.selected
          );

          if (allSelected.length === 1) {
            onSelectedElementChange(allSelected[0]!);
          } else {
            onSelectedElementChange(null);
          }

          onLayoutChange((prev) => prev);
          invalidate();
          return;
        }

        const wasSelected = hitElement.selected;

        if (!wasSelected) {
          currentLayout.unselectAll();
          hitElement.selected = true;
          onSelectedElementChange(hitElement);
        }

        const dragged = getAllLayoutElements(currentLayout)
          .filter((el) => el.selected)
          .map((el) => ({
            id: el.id,
            startX: el.x,
            startY: el.y,
          }));

        onBeforeLayoutChange?.();

        dragRef.current.isDraggingElement = true;
        dragRef.current.elementId = hitElement.id;
        dragRef.current.startMouseGridX = grid.x;
        dragRef.current.startMouseGridY = grid.y;
        dragRef.current.startElementX = hitElement.x;
        dragRef.current.startElementY = hitElement.y;
        dragRef.current.draggedElements = dragged;
        canvas.style.cursor = "move";
        invalidate();
        return;
      }

      if (currentTool.mode === "cursor") {
        if (!ev.ctrlKey) {
          currentLayout.unselectAll();
          onSelectedElementChange(null);
        }

        selectionRef.current.isSelecting = true;
        selectionRef.current.additive = ev.ctrlKey;
        selectionRef.current.startGridX = grid.x;
        selectionRef.current.startGridY = grid.y;
        selectionRef.current.endGridX = grid.x;
        selectionRef.current.endGridY = grid.y;
        canvas.style.cursor = "crosshair";
        invalidate();
        return;
      }

      if (!ev.ctrlKey) {
        currentLayout.unselectAll();
        onSelectedElementChange(null);
        onLayoutChange((prev) => prev);
        invalidate();
      }
    };

    const handleMouseMove = (ev: MouseEvent) => {
      const currentLayout = layoutRef.current;
      const currentTool = toolRef.current;

      const rect = canvas.getBoundingClientRect();
      const mouseX = ev.clientX - rect.left;
      const mouseY = ev.clientY - rect.top;

      const grid = screenToGrid(
        mouseX,
        mouseY,
        viewRef.current,
        currentLayout.gridSize
      );

      setMouseGrid((prev) =>
        prev.x === grid.x && prev.y === grid.y ? prev : { x: grid.x, y: grid.y }
      );

      const hoveredElement = currentLayout.getElement(grid.x, grid.y);

      if (tool.mode === "draw" && currentCursorRef.current) {
        const occupied = currentLayout.getLayeredElement(currentCursorRef.current, grid.x, grid.y);
        if (occupied != null) {
          setHoverGrid({ x: grid.x, y: grid.y });
        } else {
          setHoverGrid(null);
        }
      }

      if (panRef.current.isPanning) {
        ev.preventDefault();

        const dx = ev.clientX - panRef.current.lastX;
        const dy = ev.clientY - panRef.current.lastY;

        panRef.current.lastX = ev.clientX;
        panRef.current.lastY = ev.clientY;

        viewRef.current.offsetX += dx;
        viewRef.current.offsetY += dy;

        persistView();
        invalidate();
        return;
      }

      if (selectionRef.current.isSelecting) {
        ev.preventDefault();

        selectionRef.current.endGridX = grid.x;
        selectionRef.current.endGridY = grid.y;

        canvas.style.cursor = "crosshair";
        invalidate();
        return;
      }

      if (dragRef.current.isDraggingElement && dragRef.current.elementId) {
        ev.preventDefault();

        const dx = grid.x - dragRef.current.startMouseGridX;
        const dy = grid.y - dragRef.current.startMouseGridY;

        const all = getAllLayoutElements(currentLayout);
        const selectedIds = new Set(
          dragRef.current.draggedElements.map((item) => item.id)
        );

        for (const item of dragRef.current.draggedElements) {
          const el = all.find((e) => e.id === item.id);
          if (!el) continue;

          const nextX = item.startX + dx;
          const nextY = item.startY + dy;

          const occupied = currentLayout.getLayeredElement(el, nextX, nextY);

          if (occupied && !selectedIds.has(occupied.id)) {
            // setHoverGrid((prev) =>
            //   prev?.x === nextX && prev?.y === nextY
            //     ? prev
            //     : { x: nextX, y: nextY }
            // );

            setHoverGrid({ x: grid.x, y: grid.y });
            canvas.style.cursor = "not-allowed";
            return;
          }
        }

        setHoverGrid(null);

        for (const item of dragRef.current.draggedElements) {
          const el = all.find((e) => e.id === item.id);
          if (!el) continue;

          el.x = item.startX + dx;
          el.y = item.startY + dy;
        }

        canvas.style.cursor = "move";
        invalidate();
        return;
      }

      if (!editModeRef.current) {
        if (hoveredElement instanceof TrackTurnoutLeftElement ||
          hoveredElement instanceof TrackTurnoutRightElement ||
          hoveredElement instanceof TrackTurnoutTwoWayElement ||
          hoveredElement instanceof TrackTurnoutDoubleElement ||
          hoveredElement instanceof TrackSignalElement ||
          hoveredElement instanceof ClickableBaseElement

        ) {
          canvas.style.cursor = "pointer";
        } else {
          canvas.style.cursor = "default";
        }

      } else if (currentTool.mode === "draw") {
        canvas.style.cursor = "crosshair";
      } else {
        canvas.style.cursor = "default";
      }
    };
    const stopInteraction = () => {

      const wasDragging = dragRef.current.isDraggingElement;

      if (selectionRef.current.isSelecting) {
        const rect = getSelectionRect(selectionRef.current);

        if (rect) {
          const selected = applySelectionRect(
            layoutRef.current,
            rect,
            selectionRef.current.additive
          );

          if (selected.length === 1) {
            onSelectedElementChange(selected[0]!);
          } else {
            onSelectedElementChange(null);
          }

          onLayoutChange((prev) => prev);
        }

        selectionRef.current.isSelecting = false;
        selectionRef.current.additive = false;
      }

      if (panRef.current.isPanning) {
        persistView();
      }

      panRef.current.isPanning = false;
      dragRef.current.isDraggingElement = false;
      dragRef.current.elementId = null;
      dragRef.current.draggedElements = [];
      canvas.style.cursor = "default";

      if (wasDragging) {
        onLayoutChange((prev) => prev);
      }

      const cursor = currentCursorRef.current;
      if (cursor) {
        const occupied = layoutRef.current.getLayeredElement(cursor, cursor.x, cursor.y);
        if (occupied) {
          setHoverGrid({ x: cursor.x, y: cursor.y });
        }
      } else {
        setHoverGrid(null);
      }

      invalidate();
    };

    const handleMouseUp = (ev: MouseEvent) => {

      if (!editModeRef.current && ev.button == 0) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ev.clientX - rect.left;
        const mouseY = ev.clientY - rect.top;

        const grid = screenToGrid(
          mouseX,
          mouseY,
          viewRef.current,
          layoutRef.current.gridSize
        );

        const hitElement = layoutRef.current.getElement(grid.x, grid.y);
        // if (hitElement) {
        //   if (hitElement instanceof ClickableBaseElement) {
        //     const elem = hitElement as ClickableBaseElement
        //     elem.mouseUp(ev);
        //   }
        // }
        handleClickableUp(hitElement, ev);
        return;
      }
      stopInteraction();
    };

    const handleMouseLeave = () => {
      stopInteraction();
      setHoverGrid(null);
    };

    const handleContextMenu = (ev: MouseEvent) => {
      ev.preventDefault();
    };

    // =======================================================
    // TABLET
    // =======================================================

    // #region TABLET
    const handlePointerDown = (ev: PointerEvent) => {
      if (ev.pointerType !== "touch") return;

      ev.preventDefault();

      const currentLayout = layoutRef.current;
      const currentTool = toolRef.current;

      const rect = canvas.getBoundingClientRect();
      const mouseX = ev.clientX - rect.left;
      const mouseY = ev.clientY - rect.top;

      touchPointsRef.current.set(ev.pointerId, { x: mouseX, y: mouseY });

      const grid = screenToGrid(
        mouseX,
        mouseY,
        viewRef.current,
        currentLayout.gridSize
      );

      const hitElement = currentLayout.getElement(grid.x, grid.y);

      //alert("PointerDown")
      // if (!editModeRef.current) {
      //   if (currentTool.mode === "cursor" && hitElement instanceof ClickableBaseElement) {
      //     hitElement.mouseDown(ev as any);
      //   }
      // }

      if (!editModeRef.current) {
        if (hitElement instanceof TrackSignalElement) {
          if (signalAspectPopoverRef.current.opened) {
            reopenSignalAspectPopover(hitElement, ev.clientX, ev.clientY);
          } else {
            openSignalAspectPopover(hitElement, ev.clientX, ev.clientY);
          }

          try {
            canvas.setPointerCapture(ev.pointerId);
          } catch {
            // ignore
          }
          return;

        } else if (signalAspectPopoverRef.current.opened) {
          closeSignalAspectPopover();
          return;
        }

        // if (currentTool.mode === "cursor" && hitElement instanceof ClickableBaseElement) {
        //   hitElement.mouseDown(ev as any);
        // }
        if (currentTool.mode === "cursor") {
          if (handleClickableDown(hitElement, ev)) {
            try {
              canvas.setPointerCapture(ev.pointerId);
            } catch {
              // ignore
            }

            return;
          }
        }
      }

      const points = Array.from(touchPointsRef.current.entries());

      if (points.length === 1) {
        pointerPanRef.current.activePointerId = ev.pointerId;
        pointerPanRef.current.isTouchPanning = true;

        panRef.current.isPanning = true;
        panRef.current.lastX = ev.clientX;
        panRef.current.lastY = ev.clientY;

        pinchRef.current.isPinching = false;
        pinchRef.current.pointer1Id = null;
        pinchRef.current.pointer2Id = null;

        canvas.style.cursor = "grabbing";
      } else if (points.length === 2) {
        const [p1, p2] = points!;

        if (!p1 || !p2) return;
        const pt1 = p1[1];
        const pt2 = p2[1];

        const midpoint = getMidpoint(pt1, pt2);
        const startDistance = getDistance(pt1, pt2);

        if (startDistance > 0) {
          pinchRef.current.isPinching = true;
          pinchRef.current.pointer1Id = p1[0];
          pinchRef.current.pointer2Id = p2[0];
          pinchRef.current.startDistance = startDistance;
          pinchRef.current.startScale = viewRef.current.scale;
          pinchRef.current.worldCenterX =
            (midpoint.x - viewRef.current.offsetX) / viewRef.current.scale;
          pinchRef.current.worldCenterY =
            (midpoint.y - viewRef.current.offsetY) / viewRef.current.scale;

          pointerPanRef.current.isTouchPanning = false;
          pointerPanRef.current.activePointerId = null;
          panRef.current.isPanning = false;
        }
      }

      try {
        canvas.setPointerCapture(ev.pointerId);
      } catch {
        // ignore
      }
    };

    const handlePointerMove = (ev: PointerEvent) => {
      if (ev.pointerType !== "touch") return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = ev.clientX - rect.left;
      const mouseY = ev.clientY - rect.top;

      touchPointsRef.current.set(ev.pointerId, { x: mouseX, y: mouseY });

      const currentLayout = layoutRef.current;
      const grid = screenToGrid(
        mouseX,
        mouseY,
        viewRef.current,
        currentLayout.gridSize
      );

      setMouseGrid((prev) =>
        prev.x === grid.x && prev.y === grid.y ? prev : { x: grid.x, y: grid.y }
      );

      if (pinchRef.current.isPinching) {
        const id1 = pinchRef.current.pointer1Id;
        const id2 = pinchRef.current.pointer2Id;

        if (id1 == null || id2 == null) return;

        const pt1 = touchPointsRef.current.get(id1);
        const pt2 = touchPointsRef.current.get(id2);

        if (!pt1 || !pt2) return;

        ev.preventDefault();

        const midpoint = getMidpoint(pt1, pt2);
        const distance = getDistance(pt1, pt2);

        if (pinchRef.current.startDistance > 0 && distance > 0) {
          const zoomFactor = distance / pinchRef.current.startDistance;
          const newScale = clamp(pinchRef.current.startScale * zoomFactor, 0.2, 4);

          viewRef.current.scale = newScale;
          viewRef.current.offsetX =
            midpoint.x - pinchRef.current.worldCenterX * newScale;
          viewRef.current.offsetY =
            midpoint.y - pinchRef.current.worldCenterY * newScale;

          persistView();
          invalidate();
        }

        return;
      }

      if (!pointerPanRef.current.isTouchPanning) return;
      if (pointerPanRef.current.activePointerId !== ev.pointerId) return;

      ev.preventDefault();

      const dx = ev.clientX - panRef.current.lastX;
      const dy = ev.clientY - panRef.current.lastY;

      panRef.current.lastX = ev.clientX;
      panRef.current.lastY = ev.clientY;

      viewRef.current.offsetX += dx;
      viewRef.current.offsetY += dy;

      persistView();
      invalidate();
    };

    const handlePointerUp = (ev: PointerEvent) => {
      if (ev.pointerType !== "touch") return;

      const rect = canvas.getBoundingClientRect();

      // if (!editModeRef.current) {
      //   const rect = canvas.getBoundingClientRect();
      //   const mouseX = ev.clientX - rect.left;
      //   const mouseY = ev.clientY - rect.top;

      //   const grid = screenToGrid(
      //     mouseX,
      //     mouseY,
      //     viewRef.current,
      //     layoutRef.current.gridSize
      //   );

      //   const hitElement = layoutRef.current.getElement(grid.x, grid.y);
      //   if (hitElement instanceof ClickableBaseElement) {
      //     hitElement.mouseUp(ev as any);
      //   }
      // }
      if (!editModeRef.current) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ev.clientX - rect.left;
        const mouseY = ev.clientY - rect.top;

        const grid = screenToGrid(
          mouseX,
          mouseY,
          viewRef.current,
          layoutRef.current.gridSize
        );

        const hitElement = layoutRef.current.getElement(grid.x, grid.y);
        handleClickableUp(hitElement, ev);
      }
      touchPointsRef.current.delete(ev.pointerId);

      const remaining = Array.from(touchPointsRef.current.entries());

      if (pinchRef.current.isPinching) {
        pinchRef.current.isPinching = false;
        pinchRef.current.pointer1Id = null;
        pinchRef.current.pointer2Id = null;

        if (remaining.length === 1) {
          const [id, pt] = remaining[0]!;

          pointerPanRef.current.activePointerId = id;
          pointerPanRef.current.isTouchPanning = true;
          panRef.current.isPanning = true;

          panRef.current.lastX = pt.x + rect.left;
          panRef.current.lastY = pt.y + rect.top;
        }
      } else if (pointerPanRef.current.activePointerId === ev.pointerId) {
        pointerPanRef.current.activePointerId = null;
        pointerPanRef.current.isTouchPanning = false;
        panRef.current.isPanning = false;
      }

      if (touchPointsRef.current.size === 0) {
        pointerPanRef.current.activePointerId = null;
        pointerPanRef.current.isTouchPanning = false;

        pinchRef.current.isPinching = false;
        pinchRef.current.pointer1Id = null;
        pinchRef.current.pointer2Id = null;

        stopInteraction();
      } else {
        persistView();
        invalidate();
      }

      try {
        canvas.releasePointerCapture(ev.pointerId);
      } catch {
        // ignore
      }
    };

    const handlePointerCancel = (ev: PointerEvent) => {
      if (ev.pointerType !== "touch") return;

      touchPointsRef.current.delete(ev.pointerId);

      pointerPanRef.current.activePointerId = null;
      pointerPanRef.current.isTouchPanning = false;

      pinchRef.current.isPinching = false;
      pinchRef.current.pointer1Id = null;
      pinchRef.current.pointer2Id = null;

      stopInteraction();

      try {
        canvas.releasePointerCapture(ev.pointerId);
      } catch {
        // ignore
      }
    };
    // #endregion

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("contextmenu", handleContextMenu);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    canvas.addEventListener("pointerdown", handlePointerDown, { passive: false });
    canvas.addEventListener("pointermove", handlePointerMove, { passive: false });
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("contextmenu", handleContextMenu);

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerCancel);
    };
    // }, [onLayoutChange, tool, onBeforeLayoutChange]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      if (active?.tagName !== "CANVAS") {
        return;
      }

      const currentLayout = layoutRef.current;
      const currentTool = toolRef.current;
      const currentEditMode = editModeRef.current;

      const sel = currentLayout.getSelected();
      const selectedElements = getAllLayoutElements(currentLayout).filter(
        (el) => el.selected
      );

      if (ev.key.toLowerCase() == "escape") {
        closeSignalAspectPopover();
      }

      if (ev.key.toLowerCase() === "f") {
        ev.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        fitLayoutToView(
          layoutRef.current,
          viewRef.current,
          width,
          height
        );

        persistView();
        invalidate();
        return;
      }

      if (!currentEditMode) return;


      if (ev.key === "r" || ev.key === "R") {
        ev.preventDefault();

        if (currentTool.mode === "draw") {
          const cursor = currentCursorRef.current;
          if (!cursor) return;

          cursor.rotation = (cursor.rotation + cursor.rotationStep) % 360;
          setCurrentCursor(cursor.clone());
          invalidate();
          return;
        }

        if (currentTool.mode === "cursor") {
          if (!sel) return;

          onBeforeLayoutChange?.();

          sel.rotation = (sel.rotation + sel.rotationStep) % 360;
          onLayoutChange((prev) => prev);
          invalidate();
          return;
        }
      }

      if (ev.key === "Delete" || ev.key === "Backspace") {
        if (!sel) return;

        ev.preventDefault();
        onBeforeLayoutChange?.();
        //currentLayout.removeElement(sel);

        const toRemove = [...selectedElements];
        for (const el of toRemove) {
          currentLayout.removeElement(el);
        }

        if (selectedElementRef.current?.id === sel.id) {
          onSelectedElementChange(null);
        }

        onLayoutChange((prev) => prev);
        invalidate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    //}, [onLayoutChange, onBeforeLayoutChange]);
  }, []);


  // =======================================================
  // popover
  // =======================================================
  const openSignalAspectPopover = (
    signal: TrackSignalElement,
    clientX: number,
    clientY: number
  ) => {

    const green = new TrackSignalElement(0, 0);
    green.aspect = signal.aspect;
    green.setGreen();

    const red = new TrackSignalElement(0, 0);
    red.aspect = signal.aspect;
    red.setRed();

    const yellow = new TrackSignalElement(0, 0);
    yellow.aspect = signal.aspect;
    yellow.setYellow();

    const white = new TrackSignalElement(0, 0);
    white.aspect = signal.aspect;
    white.setWhite();

    setSignalAspectPopover({
      opened: true,
      x: clientX,
      y: clientY,
      signal,
      previews: {
        green: green,
        red: red,
        yellow: yellow,
        white: white,
      }
    });

  };

  const closeSignalAspectPopover = () => {
    setSignalAspectPopover((prev) => ({
      ...prev,
      opened: false,
      signal: null,
    }));
  };

  return (
    <>
      <canvas tabIndex={0} ref={canvasRef} className="track-canvas" />

      <Popover
        opened={signalAspectPopover.opened}
        onChange={(opened) => {
          if (!opened) closeSignalAspectPopover();
        }}

        withArrow
        shadow="xl"
        closeOnClickOutside={false}
        closeOnEscape
        withinPortal
        offset={18}
        transitionProps={{
          transition: "scale",
          duration: 200,
          timingFunction: "ease-out",
        }}
      >
        <Popover.Target>
          <Box p={4}
            style={{
              position: "fixed",
              left: signalAspectPopover.x,
              top: signalAspectPopover.y,
              width: 0,
              height: 0,
              pointerEvents: "none",
            }}
          />
        </Popover.Target>

        <Popover.Dropdown
          p={4}

          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >

          <Stack gap="xs">
            {/* <Text p={2} bg={"blue"}>Signal aspect</Text> */}
            <Group gap={4}>
              <Box className="signal-aspect-button"
                onClick={() => {
                  closeSignalAspectPopover();
                  signalAspectPopover.signal?.sendGreen();
                }}
              >
                <ElementPreview style={{ cursor: "pointer" }}
                  element={signalAspectPopover.previews?.green!}
                  label="Green"
                  width={40}
                  height={40}
                  translateX={-10}
                />
              </Box>

              <Box className="signal-aspect-button"
                onClick={() => {
                  closeSignalAspectPopover();
                  signalAspectPopover.signal?.sendRed();
                }}
              >
                <ElementPreview
                  element={signalAspectPopover.previews?.red!}
                  label="Red"
                  width={40}
                  height={40}
                  translateX={-10}
                />
              </Box>

              {signalAspectPopover.signal && signalAspectPopover.signal.aspect > 2 && (
                <Box className="signal-aspect-button"
                  onClick={() => {
                    closeSignalAspectPopover();
                    signalAspectPopover.signal?.sendYellow();
                  }}
                >
                  <ElementPreview
                    element={signalAspectPopover.previews?.yellow!}
                    label="Yellow"
                    width={40}
                    height={40}
                    translateX={-10}
                  />
                </Box>)}

              {signalAspectPopover.signal && signalAspectPopover.signal!.aspect > 3 && (
                <Box className="signal-aspect-button"
                  onClick={() => {
                    closeSignalAspectPopover();
                    signalAspectPopover.signal?.sendWhite();
                  }}
                >
                  <ElementPreview
                    element={signalAspectPopover.previews?.white!}
                    label="White"
                    width={40}
                    height={40}
                    translateX={-10}
                  />
                </Box>
              )}


            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </>
  );
}

function createCursorElement(tool: EditorTool): BaseElement | null {
  switch (tool.elementType) {
    case ELEMENT_TYPES.TRACK:
      return CursorTrackElement;

    case ELEMENT_TYPES.TRACK_END:
      return CursorTrackEndElement;

    case ELEMENT_TYPES.TRACK_CORNER:
      return CursorTrackCornerElement;

    case ELEMENT_TYPES.TRACK_CURVE:
      return CursorTrackCurveElement;

    case ELEMENT_TYPES.TRACK_CROSSING:
      return CursorTrackCrossingElement;

    case ELEMENT_TYPES.TRACK_TURNOUT_LEFT:
      return CursorTrackTurnoutLeftElement;

    case ELEMENT_TYPES.TRACK_TURNOUT_RIGHT:
      return CursorTrackTurnoutRightElement;

    case ELEMENT_TYPES.TRACK_TURNOUT_TWO_WAY:
      return CursorTrackTurnoutTwoWayElement;

    case ELEMENT_TYPES.TRACK_TURNOUT_DOUBLE:
      return CursorTrackTurnoutDoubleElement;

    case ELEMENT_TYPES.TRACK_SENSOR:
      return CursorTrackSensorElement;

    case ELEMENT_TYPES.BUTTON:
      return CursorButtonElement;

    case ELEMENT_TYPES.BUTTON_AUDIO:
      return CursorAudioButtonElement;

    case ELEMENT_TYPES.BUTTON_ROUTE:
      return CursorRouteButtonElement;

    case ELEMENT_TYPES.CLOCK:
      return CursorClockElement;

    case ELEMENT_TYPES.TREE:
      return CursorTreeElement;

    case ELEMENT_TYPES.TRACK_BLOCK:
      return CursorBlockElement;

    case ELEMENT_TYPES.TRACK_SIGNAL2:
      return CursorTrackSignal2Element;

    case ELEMENT_TYPES.TRACK_SIGNAL3:
      return CursorTrackSignal3Element;

    case ELEMENT_TYPES.TRACK_SIGNAL4:
      return CursorTrackSignal4Element;

    default:
      return null;
  }
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  editMode: boolean,
  colorScheme: "light" | "dark" | "auto",
  view: ViewState,
  mouseGrid: { x: number; y: number },
  tool: EditorTool,
  hoverGrid: { x: number; y: number } | null,
  currentCursor: BaseElement | null,
  layout: Layout,
  settings: EditorSettings,
  dragId?: string,
  selected?: BaseElement,
  selectionRect?: SelectionRect | null,
  turnoutSelectionMode?: boolean,
) {
  const isDark = colorScheme !== "light";

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height, isDark);

  ctx.save();
  ctx.translate(view.offsetX, view.offsetY);
  ctx.scale(view.scale, view.scale);

  if (settings.showGrid) {
    drawGrid(ctx, width, height, layout.gridSize, isDark, view);
  }

  if (hoverGrid) {
    const gs = layout.gridSize;
    ctx.strokeStyle = "#ef4444";
    ctx.fillStyle = "#ef444450";
    ctx.lineWidth = 2 / view.scale;
    ctx.fillRect(hoverGrid.x * gs, hoverGrid.y * gs, gs, gs);
    ctx.strokeRect(hoverGrid.x * gs, hoverGrid.y * gs, gs, gs);

    if (currentCursor) {

      //  const rect = currentCursor.getBounds();
      //  ctx.fillRect(rect.x, rect.y , rect.width, rect.height);
      //  ctx.strokeRect(rect.x, rect.y , rect.width, rect.height);

    }
  }

  const opt: DrawOptions = {
    showOccupancySensorAddress: settings.showOccupacySensorAddress,
    showSensorAddress: settings.showSensorAddress,
    showTurnoutAddress: settings.showTurnoutAddress,
    showSignalAddress: settings.showSignalAddress,
    darkMode: isDark,
  };

  layout.draw(ctx, opt);

  if (currentCursor) {
    currentCursor.x = mouseGrid.x;
    currentCursor.y = mouseGrid.y;

    currentCursor.draw(ctx, {
      showOccupancySensorAddress: false,
      showSensorAddress: false,
      showSignalAddress: false,
      showTurnoutAddress: false
    });
  }

  if (selectionRect) {
    drawSelectionRect(ctx, layout.gridSize, selectionRect, view.scale);
  }

  ctx.restore();

  if (editMode) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawInfo(ctx, width, editMode, isDark, view.scale, mouseGrid, tool, currentCursor);
  }
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isDark: boolean
) {
  ctx.fillStyle = isDark ? "#313131" : "#F8F9FA";
  ctx.fillRect(0, 0, width, height);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  isDark: boolean,
  view: ViewState
) {
  ctx.strokeStyle = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1 / view.scale;

  const worldLeft = -view.offsetX / view.scale;
  const worldTop = -view.offsetY / view.scale;
  const worldRight = worldLeft + width / view.scale;
  const worldBottom = worldTop + height / view.scale;

  const startX = Math.floor(worldLeft / gridSize) * gridSize;
  const endX = Math.ceil(worldRight / gridSize) * gridSize;
  const startY = Math.floor(worldTop / gridSize) * gridSize;
  const endY = Math.ceil(worldBottom / gridSize) * gridSize;

  for (let x = startX; x <= endX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, worldTop);
    ctx.lineTo(x, worldBottom);
    ctx.stroke();
  }

  for (let y = startY; y <= endY; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(worldLeft, y);
    ctx.lineTo(worldRight, y);
    ctx.stroke();
  }
}

function drawInfo(
  ctx: CanvasRenderingContext2D,
  width: number,
  editMode: boolean,
  isDark: boolean,
  scale: number,
  mouseGrid: { x: number; y: number },
  tool: EditorTool,
  currentCursor: BaseElement | null
) {
  const px = 20;
  const toolText =
    tool.mode === "cursor" ? "Kurzor" : `Rajz: ${tool.elementType}`;

  const rotationText =
    tool.mode === "draw" && currentCursor
      ? ` | Rot: ${currentCursor.rotation}°`
      : "";

  const text = `${editMode ? "Szerkesztési mód" : "Nézet mód"} | Tool: ${toolText}${rotationText} | Zoom: ${Math.round(
    scale * 100
  )}% | X: ${mouseGrid.x} Y: ${mouseGrid.y}`;

  ctx.fillStyle = isDark
    ? "rgba(0,0,0,0.35)"
    : "rgba(255,255,255,0.85)";
  ctx.fillRect(px, 16, 470, 32);

  ctx.fillStyle = isDark ? "#ffffff" : "#000000";
  ctx.font = "13px sans-serif";
  ctx.fillText(text, px + 20, 36);
}

function screenToGrid(
  screenX: number,
  screenY: number,
  view: ViewState,
  gridSize: number
): { x: number; y: number } {
  const worldX = (screenX - view.offsetX) / view.scale;
  const worldY = (screenY - view.offsetY) / view.scale;

  return {
    x: Math.floor(worldX / gridSize),
    y: Math.floor(worldY / gridSize),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function drawSelectionRect(
  ctx: CanvasRenderingContext2D,
  gridSize: number,
  rect: SelectionRect,
  scale: number
) {
  const n = normalizeSelectionRect(rect);

  const x = n.left * gridSize;
  const y = n.top * gridSize;
  const w = (n.right - n.left + 1) * gridSize;
  const h = (n.bottom - n.top + 1) * gridSize;

  ctx.save();
  ctx.strokeStyle = "#339af0";
  ctx.fillStyle = "rgba(51, 154, 240, 0.18)";
  ctx.lineWidth = 2 / scale;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function normalizeSelectionRect(rect: SelectionRect) {
  return {
    left: Math.min(rect.startGridX, rect.endGridX),
    right: Math.max(rect.startGridX, rect.endGridX),
    top: Math.min(rect.startGridY, rect.endGridY),
    bottom: Math.max(rect.startGridY, rect.endGridY),
  };
}

function getSelectionRect(selection: SelectionState): SelectionRect | null {
  if (!selection.isSelecting) return null;

  return {
    startGridX: selection.startGridX,
    startGridY: selection.startGridY,
    endGridX: selection.endGridX,
    endGridY: selection.endGridY,
  };
}

function getAllLayoutElements(layout: Layout): BaseElement[] {
  return [
    ...layout.track.elements,
    ...layout.sensors.elements,
    ...layout.signals.elements,
    ...layout.blocks.elements,
    ...layout.buildings.elements,
  ];
}

function applySelectionRect(
  layout: Layout,
  rect: SelectionRect,
  additive = false
): BaseElement[] {
  const n = normalizeSelectionRect(rect);
  const all = getAllLayoutElements(layout);

  if (!additive) {
    layout.unselectAll();
  }

  const selected = all.filter((el) => {
    return (
      el.x >= n.left &&
      el.x <= n.right &&
      el.y >= n.top &&
      el.y <= n.bottom
    );
  });

  for (const el of selected) {
    el.selected = true;
  }

  return all.filter((el) => el.selected);
}

function getLayoutBounds(layout: Layout) {
  const elements = getAllLayoutElements(layout);

  if (elements.length === 0) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x);
    maxY = Math.max(maxY, el.y);
  }

  return { minX, minY, maxX, maxY };
}

function fitLayoutToView(
  layout: Layout,
  view: ViewState,
  canvasWidth: number,
  canvasHeight: number
) {
  const bounds = getLayoutBounds(layout);
  if (!bounds) return;

  const gridSize = layout.gridSize;
  const padding = 40;

  // A layout világkoordinátás szélei pixelben
  const worldLeft = bounds.minX * gridSize;
  const worldTop = bounds.minY * gridSize;
  const worldRight = (bounds.maxX + 1) * gridSize;
  const worldBottom = (bounds.maxY + 1) * gridSize;

  const worldWidth = worldRight - worldLeft;
  const worldHeight = worldBottom - worldTop;

  if (worldWidth <= 0 || worldHeight <= 0) return;

  const availableWidth = Math.max(1, canvasWidth - padding * 2);
  const availableHeight = Math.max(1, canvasHeight - padding * 2);

  let newScale = Math.min(
    availableWidth / worldWidth,
    availableHeight / worldHeight
  );

  newScale = clamp(newScale, 0.2, 4);

  view.scale = newScale;

  view.offsetX =
    (canvasWidth - worldWidth * newScale) / 2 - worldLeft * newScale;

  view.offsetY =
    (canvasHeight - worldHeight * newScale) / 2 - worldTop * newScale;
}

function getDistance(a: TouchPoint, b: TouchPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getMidpoint(a: TouchPoint, b: TouchPoint): TouchPoint {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

