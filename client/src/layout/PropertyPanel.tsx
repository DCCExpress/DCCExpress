import { Accordion, ActionIcon, Badge, Box, Button, Card, Checkbox, ColorInput, ColorPicker, ColorSwatch, DEFAULT_THEME, Divider, Group, NumberInput, ScrollArea, Stack, Text, TextInput, Title, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { BaseElement } from "../models/editor/core/BaseElement";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { IEditableProperty } from "../models/editor/elements/PropertyDescriptor";
import BitToggleElement from "../components/editor/BitToggleElement";
import { TrackTurnoutLeftElement } from "../models/editor/elements/TrackTurnoutLeftElement";
import { TrackTurnoutRightElement } from "../models/editor/elements/TrackTurnoutRightElement";
import ElementPreview from "../models/editor/rendering/ElementPreviewRenderer";
import { ELEMENT_TYPES } from "../models/editor/types/EditorTypes";
import { wsApi } from "../services/wsApi";
import { useEditorSettings } from "../context/EditorSettingsContext";
import { SetTurnoutMessage } from "../../../common/src/types";
import { TrackSignalElement } from "../models/editor/elements/TrackSignalElement";
import { TrackTurnoutTwoWayElement } from "../models/editor/elements/TrackTurnoutTwoWayElement";
import TrackTurnoutDoubleElement from "../models/editor/elements/TrackTurnoutDoubleElement";
import { isTurnoutElement, Layout } from "../models/editor/core/Layout";
import { RouteButtonElement, RouteTurnoutItem } from "../models/editor/elements/RouteButtonElement";
import { IconTrash } from "@tabler/icons-react";
import "../styles/propertypanel.css"
import { TrackTurnoutElement } from "../models/editor/elements/TrackTurnoutElement";
import ControlPanel from "../components/ControlPanel";

type PropertyPanelProps = {
  selectedElement: BaseElement | null;
  //onSelectedElementChange: (element: BaseElement | null) => void;
  onUpdateSelectedElement: (element: BaseElement | null) => void;
  invalidate: number;
  editMode: boolean;
  turnoutSelectionMode: boolean;
  setTurnoutSelectionMode: (on: boolean) => void;
  layout: Layout;
  onLayoutChange: Dispatch<SetStateAction<Layout>>;
};


const ColorsDefault = [
  "#000000", "#ffffff", "#868e96",
  "#f11414", "#fa5252", "#e64980",
  "#be4bdb", "#7950f2", "#4c6ef5",
  "#228be6", "#15aabf", "#12b886",
  "#40c057", "#82c91e", "#fab005",
  "#fd7e14",
]



function findElementById(layout: Layout, id: string) {
  return layout.getAllElements().find((el) => el.id === id) ?? null;
}

function createPreviewElement<T extends BaseElement>(element: T): T {
  const preview = element.clone() as T;

  preview.id = element.id;
  preview.x = 0;
  preview.y = 0;
  preview.selected = false;
  preview.enabled = true;

  return preview;
}

export default function RightPropertyPanel({ selectedElement, onUpdateSelectedElement, invalidate, editMode, turnoutSelectionMode, setTurnoutSelectionMode, layout, onLayoutChange }: PropertyPanelProps) {

  const trackturnoutleft1 = new TrackTurnoutLeftElement(0, 0);
  trackturnoutleft1.turnoutClosed = true;

  const trackturnoutleft2 = new TrackTurnoutLeftElement(0, 0);
  trackturnoutleft2.turnoutClosed = false;

  const trackturnoutright = new TrackTurnoutRightElement(0, 0);

  const [properties, setProperties] = useState<IEditableProperty[] | null>(null);
  const [helpOpened, setHelpOpened] = useState<string | null>("help");
  const { settings, updateSettings } = useEditorSettings();

  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    //
    if (editMode) {
      if (selectedElement != null) {
        setProperties(selectedElement.getEditableProperties());
      } else {
        setProperties(null);
      }
    } else {
      setProperties(null);
    }
  }, [selectedElement, editMode])

  const helpHtml = useMemo(() => {
    if (!selectedElement) return "";

    // Később ezt akár az elemből is kérheted:
    // return selectedElement.getHelpHtml?.() ?? "";

    switch (selectedElement.type) {
      case "track":
        return `
          <h3 style="margin-top:0;">Track help</h3>
          <p>This element represents a straight track section.</p>
          <ul>
            <li><b>Name</b>: display name of the track</li>
            <li><b>Length</b>: logical or rendered length</li>
            <li><b>Color</b>: drawing color</li>
          </ul>
        `;
      case "trackturnoutleft":
        return `
          <h3 style="margin-top:0;">Turnout help</h3>
          <p>This element represents a railway switch.</p>
          <ul>
            <li>Set its address carefully</li>
            <li>Check direction and rotation</li>
            <li>Use matching control logic in your route system</li>
          </ul>
        `;
      default:
        return `
          <h3 style="margin-top:0;">Element help</h3>
          <p>Here you can edit the selected element's properties.</p>
          <ul>
            <li>String fields store text values</li>
            <li>Number fields store numeric values</li>
            <li>Checkboxes toggle options</li>
            <li>Color fields define drawing colors</li>
          </ul>
        `;
    }
  }, [selectedElement]);

  // const previewTurnoutClosed = useMemo(() => {
  //   if(selectedElement &&
  //      selectedElement.type === ELEMENT_TYPES.TRACK_TURNOUT_LEFT) {
  //     trackturnoutleft1.rotation = selectedElement.rotation;
  //     trackturnoutleft1.turnoutClosed = true;
  //   }    
  //   return trackturnoutleft1 as BaseElement;
  // }, [selectedElement, invalidate]);

  const getPreviewTurnout = function (elem: BaseElement, closed: boolean) {
    if (selectedElement) {
      if (selectedElement.type === ELEMENT_TYPES.TRACK_TURNOUT_LEFT) {
        const t = new TrackTurnoutLeftElement(0, 0)
        t.rotation = selectedElement.rotation;
        t.turnoutClosed = closed;
        return t as BaseElement;
      } else if (selectedElement.type === ELEMENT_TYPES.TRACK_TURNOUT_RIGHT) {
        const t = new TrackTurnoutRightElement(0, 0)
        t.rotation = selectedElement.rotation;
        t.turnoutClosed = closed;
        return t as BaseElement;
      }
    }
    return trackturnoutleft1 as BaseElement;
  }

  const getPreviewSignal = function (elem: BaseElement, color: number) {
    if (selectedElement) {
      if (selectedElement.type === ELEMENT_TYPES.TRACK_SIGNAL2) {
        const t = new TrackSignalElement(0, 0)
        t.aspect = (selectedElement as TrackSignalElement).aspect
        t.rotation = 90; //selectedElement.rotation;
        if (color === 1) {
          t.setGreen();
        } else if (color === 2) {
          t.setRed();
        } else if (color === 3) {
          t.setYellow();
        } else if (color === 4) {
          t.setWhite();
        }
        return t as BaseElement;
      }
      // else if (selectedElement.type === ELEMENT_TYPES.TRACK_SIGNAL3) {
      //   const t = new TrackSignalElement(0, 0)
      //   t.aspect = 3;
      //   t.rotation = 90; //selectedElement.rotation;
      //   return t as BaseElement;
      // }
      // else if (selectedElement.type === ELEMENT_TYPES.TRACK_SIGNAL4) {
      //   const t = new TrackSignalElement(0, 0)
      //   t.aspect = 4;
      //   t.rotation = 90; //selectedElement.rotation;
      //   return t as BaseElement;
      // }
    }
    return trackturnoutleft1 as BaseElement;
  }


  const handleChange = (prop: IEditableProperty, rawValue: any) => {
    if (selectedElement != null) {

      switch (prop.type) {
        case "number":
          if (prop.validate) {
            const isValid = prop.validate(rawValue);
            (selectedElement as any)[prop.key] = parseInt(rawValue);
          } else {
            (selectedElement as any)[prop.key] = parseInt(rawValue);
          }
          break;
        case "boolean":
          (selectedElement as any)[prop.key] = Boolean(rawValue);
          break;
        case "checkbox":
          (selectedElement as any)[prop.key] = (rawValue) ? "checked" : "";
          break;
        default:
          (selectedElement as any)[prop.key] = rawValue;
          break;
      }

      onUpdateSelectedElement(null);
    }
  };

  if (editMode) {
    return (
      <ScrollArea h="100%" style={{ margin: 0, padding: 0 }}>
        <div className="property-panel">
          <Text c="blue" tt="capitalize">Properties</Text>
          {!selectedElement &&
            (
              <>
                <Card withBorder p="xs">
                  <Group mb="sm">
                    <Text fw={500}>Editor</Text>
                  </Group>
                  <Checkbox
                    mb={4}
                    label="Show occupancy address"
                    checked={settings.showOccupacySensorAddress}
                    onChange={(e) =>
                      updateSettings({ showOccupacySensorAddress: e.currentTarget.checked })
                    }
                  />
                  <Checkbox
                    mb={4}
                    label="Show sensor address"
                    checked={settings.showSensorAddress}
                    onChange={(e) =>
                      updateSettings({ showSensorAddress: e.currentTarget.checked })
                    }
                  />

                  <Checkbox
                    mb={4}
                    label="Show turnout address"
                    checked={settings.showTurnoutAddress}
                    onChange={(e) =>
                      updateSettings({ showTurnoutAddress: e.currentTarget.checked })
                    }
                  />

                  <Checkbox
                    mb={4}
                    label="Show signal address"
                    checked={settings.showSignalAddress}
                    onChange={(e) =>
                      updateSettings({ showSignalAddress: e.currentTarget.checked })
                    }
                  />

                  <Checkbox
                    mb={4}
                    label="Show grid"
                    checked={settings.showGrid}
                    onChange={(e) =>
                      updateSettings({ showGrid: e.currentTarget.checked })
                    }
                  />
                </Card>
              </>
            )
          }

          {selectedElement && properties && properties.map((prop) => (
            <div key={prop.key}
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: 12,
                marginLeft: 0,
                marginRight: 16
              }}>
              <Card withBorder p="xs">
                {prop.type === "string" && (
                  <>
                    {/* <label>{prop.label}</label> */}
                    <TextInput
                      label={prop.label}
                      readOnly={prop.readonly}
                      type="text"
                      value={(selectedElement as any)[prop.key] ?? ""}
                      onChange={(e) => handleChange(prop, e.target.value)}
                    />
                  </>
                )}

                {prop.type === "number" && (
                  <>
                    {/* <label>{prop.label}</label> */}
                    <NumberInput
                      label={prop.label}
                      disabled={prop.readonly!}
                      //type="number"
                      value={(selectedElement as any)[prop.key] ?? 0}
                      onChange={(e) => handleChange(prop, e)}
                    //onBlur={(e) => handleChange(prop, e.target.value)}
                    />
                  </>
                )}

                {prop.type === "boolean" && (
                  <>
                    <label>{prop.label}</label>
                    <input aria-label="input Field"
                      disabled={prop.readonly}
                      type="checkbox"
                      checked={Boolean((selectedElement as any)[prop.key])}
                      onChange={(e) => handleChange(prop, e.target.checked)}
                    />
                  </>
                )}
                {prop.type === "checkbox" && (
                  <Checkbox
                    label={prop.label}
                    checked={Boolean((selectedElement as any)[prop.key])}
                    onChange={(e) => handleChange(prop, e.target.checked)}
                  />
                )}

                {prop.type == "colorpicker" && (
                  <>
                    <label>{prop.label}</label>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(8, 24px)",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {ColorsDefault.map((color) => {
                        const selectedColor = ((selectedElement as any)[prop.key] ?? "").toLowerCase();
                        const isSelected = selectedColor === color.toLowerCase();

                        return (
                          <div
                            key={color}
                            onClick={() => {
                              if (!prop.readonly) {
                                handleChange(prop, color);
                              }
                            }}
                            style={{
                              width: 32,
                              padding: 3,
                              border: isSelected ? "2px solid #339af0" : "2px solid transparent",
                              borderRadius: 2,
                              cursor: prop.readonly ? "default" : "pointer",
                            }}
                          >
                            <ColorSwatch color={color} size={22} />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {prop.type === "bittoggle" && (
                  <Group>
                    <Group>
                      <Box className="route-turnout-preview-button">
                        <ElementPreview element={getPreviewTurnout(selectedElement, true)} label="Closed" width={40} height={40} onClick={() => {
                          const t = selectedElement as TrackTurnoutLeftElement
                          //const data: SetTurnoutMessage = { address: t.turnoutAddress, closed: t.turnoutClosedValue };
                          //const data: SetTurnoutMessage = {type: "setTurnout", data: { address: t.turnoutAddress, closed: t.turnoutClosedValue }};
                          //console.log("WSAPI:", data)
                          wsApi.setTurnout(t.turnoutAddress, t.turnoutClosedValue);
                        }}
                        />
                      </Box>
                      <BitToggleElement
                        value={(selectedElement as any)[prop.key]}
                        onChange={(e) => handleChange(prop, e)}
                      />
                    </Group>
                    <Group>
                      <Box className="route-turnout-preview-button">
                        <ElementPreview element={getPreviewTurnout(selectedElement, false)} label="Opened" width={40} height={40} onClick={() => {
                          const t = selectedElement as TrackTurnoutLeftElement
                          //const data: SetTurnoutMessage = {type: "setTurnout", data: { address: t.turnoutAddress, closed: !t.turnoutClosedValue }};
                          wsApi.setTurnout(t.turnoutAddress, !t.turnoutClosedValue);
                        }}
                        />
                      </Box>

                      <BitToggleElement
                        value={!((selectedElement as any)[prop.key])}
                        onChange={(e) => handleChange(prop, (!e))}
                      />
                    </Group>

                  </Group>
                )}

                {prop.type === "signal2" && (
                  <Group>
                    {/* GREEN */}
                    <Group>
                      <Box className="route-turnout-preview-button">
                        <ElementPreview style={{ width: "50%" }} element={getPreviewSignal(selectedElement, 1)} label="Green" width={40} height={40} translateX={-10} onClick={() => {
                          const t = selectedElement as TrackSignalElement;
                          t.sendGreen();
                          //wsApi.setTurnout(t.turnoutAddress, t.turnoutClosedValue);
                        }}
                        />
                      </Box>

                      <NumberInput w="50%"
                        value={(selectedElement as TrackSignalElement).valueGreen}
                        onChange={(e) => {
                          const t = selectedElement as TrackSignalElement;
                          t.valueGreen = Number(e) ?? 1;
                          onUpdateSelectedElement(t);
                        }}
                      />
                    </Group>

                    {/* RED */}
                    <Group>

                      <Box className="route-turnout-preview-button">
                        <ElementPreview style={{ width: "50%" }} element={getPreviewSignal(selectedElement, 2)} label="Red" width={40} height={40} translateX={-10} onClick={() => {
                          const t = selectedElement as TrackSignalElement;
                          t.sendRed();
                        }}
                        />
                      </Box>

                      <NumberInput w="50%"
                        value={(selectedElement as TrackSignalElement).valueRed}
                        onChange={(e) => {
                          const t = selectedElement as TrackSignalElement;
                          t.valueRed = Number(e) ?? 1;
                          onUpdateSelectedElement(t);
                        }}
                      />
                    </Group>

                    {/* YELLOW */}
                    {(selectedElement as TrackSignalElement).aspect >= 3 && (
                      <Group>
                        <Box className="route-turnout-preview-button">
                          <ElementPreview style={{ width: "50%" }} element={getPreviewSignal(selectedElement, 3)} label="Yellow" width={40} height={40} translateX={-10} onClick={() => {
                            const t = selectedElement as TrackSignalElement;
                            t.sendYellow();
                          }}
                          />
                        </Box>
                        <NumberInput w="50%"
                          value={(selectedElement as TrackSignalElement).valueYellow}
                          onChange={(e) => {
                            const t = selectedElement as TrackSignalElement;
                            t.valueYellow = Number(e) ?? 1;
                            onUpdateSelectedElement(t);
                          }}
                        />
                      </Group>)}

                    {/* WHITE */}
                    {(selectedElement as TrackSignalElement).aspect >= 4 && (
                      <Group>
                        <Box className="route-turnout-preview-button">
                          <ElementPreview style={{ width: "50%" }} element={getPreviewSignal(selectedElement, 4)} label="White" width={40} height={40} translateX={-10} onClick={() => {
                            const t = selectedElement as TrackSignalElement;
                            t.sendWhite();
                          }}
                          />
                        </Box>
                        <NumberInput w="50%"
                          value={(selectedElement as TrackSignalElement).valueWhite}
                          onChange={(e) => {
                            const t = selectedElement as TrackSignalElement;
                            t.valueWhite = Number(e) ?? 1;
                            onUpdateSelectedElement(t);
                          }}
                        />
                      </Group>
                    )}

                  </Group>
                )}

                {prop.type === "turnoutSelection" && (() => {
                  const items = Array.isArray((selectedElement as any)[prop.key])
                    ? ((selectedElement as any)[prop.key] as RouteTurnoutItem[])
                    : [];

                  const setRouteTurnoutClosed = (turnoutId: string, closed: boolean) => {
                    if (!selectedElement) return;

                    const routeItems = Array.isArray((selectedElement as any)[prop.key])
                      ? ((selectedElement as any)[prop.key] as RouteTurnoutItem[])
                      : [];

                    const item = routeItems.find((x) => x.turnoutId === turnoutId);
                    if (!item) return;

                    item.closed = closed;

                    onLayoutChange((prev) => prev);
                  };

                  const toggleRouteTurnout = (turnoutId: string) => {
                    const item = items.find((x) => x.turnoutId === turnoutId);
                    if (!item) return;

                    setRouteTurnoutClosed(turnoutId, !item.closed);
                  };

                  return (
                    <Stack gap="xs">
                      <Button
                        size="xs"
                        variant={turnoutSelectionMode ? "filled" : "light"}
                        onClick={() => {
                          setTurnoutSelectionMode(!turnoutSelectionMode);
                        }}
                      >
                        {turnoutSelectionMode ? "Finish selection" : "Add turnouts"}
                      </Button>

                      {items.length === 0 ? (
                        <Text size="xs" c="dimmed">
                          No turnouts selected
                        </Text>
                      ) : (
                        <Stack gap={6}>

                          {items.map((item) => {
                            const turnout = findElementById(layout, item.turnoutId);

                            if (!turnout) {
                              return (
                                <Group key={item.turnoutId} justify="space-between" gap="xs">
                                  <Text size="xs" c="red">
                                    Missing turnout: {item.turnoutId}
                                  </Text>

                                  <ActionIcon
                                    size="sm"
                                    color="red"
                                    variant="subtle"
                                    onClick={() => {
                                      if (!selectedElement) return;

                                      const routeButton = selectedElement as RouteButtonElement;
                                      routeButton.removeTurnout(item.turnoutId);

                                      onUpdateSelectedElement(selectedElement);
                                    }}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Group>
                              );
                            }

                            const previewTurnout = turnout.clone();
                            previewTurnout.id = turnout.id;
                            previewTurnout.x = 0;
                            previewTurnout.y = 0;
                            previewTurnout.selected = false;
                            previewTurnout.enabled = true;
                            (previewTurnout as any).turnoutClosed = item.closed;

                            return (
                              <Group
                                key={item.turnoutId}
                                gap="xs"
                                wrap="nowrap"
                                align="center"
                              >
                                <Box
                                  className="route-turnout-preview-button"
                                  onClick={() => {
                                    //item.closed = !item.closed;
                                    const elem = layout.getElementById(item.turnoutId);
                                    if(elem instanceof TrackTurnoutElement) {
                                      const turnout = elem as TrackTurnoutElement;  
                                      turnout.toggle();
                                      item.closed = turnout.turnoutClosed == turnout.turnoutClosedValue;
                                    } else {
                                      alert("Not instance of Turnout!")
                                    }
                                    

                                    onUpdateSelectedElement(selectedElement);
                                  }}
                                >
                                  <ElementPreview
                                    element={previewTurnout}
                                    label={"#" + (previewTurnout as any).turnoutAddress}
                                    width={40}
                                    height={40}
                                  />
                                </Box>

                                <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                                  <Text size="xs" fw={500} truncate>
                                    {turnout.name || "Turnout"}
                                  </Text>

                                  {/* <Text size="10px" c="dimmed" ff="monospace" truncate>
                                    {item.turnoutId}
                                  </Text> */}

                                  {/* <Badge size="xs" variant="light">
                                    {item.closed ? "closed" : "thrown"}
                                  </Badge> */}
                                </Stack>

                                <ActionIcon
                                  size="sm"
                                  color="red"
                                  variant="subtle"
                                  title="Remove turnout"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    if (!selectedElement) return;

                                    const routeButton = selectedElement as RouteButtonElement;
                                    routeButton.removeTurnout(item.turnoutId);

                                    onUpdateSelectedElement(selectedElement);
                                  }}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>
                            );
                          })}
                        </Stack>
                      )}
                    </Stack>
                  );
                })()}

              </Card >

            </div>
          ))}

          {(
            <Accordion
              value={helpOpened}
              onChange={setHelpOpened}
              mr={0}
              mt={10} chevronPosition="right" variant="contained">
              <Accordion.Item value="help">
                <Accordion.Control style={(theme) => ({
                  backgroundColor:
                    colorScheme === "dark"
                      ? theme.colors.dark[8]
                      : theme.colors.gray[3],
                })}>
                  <Group gap={0} >
                    <Text>❓</Text>
                    <Text>Help</Text>
                  </Group>

                </Accordion.Control>
                <Accordion.Panel>
                  <div

                    dangerouslySetInnerHTML={{ __html: selectedElement ? selectedElement?.getHelp() : "GENERAL HELP" }}

                  />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          )}


        </div>



      </ScrollArea>
    );
  }
  return (
    <>
    <Text>Control Mode</Text>
    <ControlPanel />
    </>
  )
}