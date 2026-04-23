import { Accordion, Card, Checkbox, ColorSwatch, Group, NumberInput, ScrollArea, Text, TextInput, useMantineColorScheme } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import BitToggleElement from "../components/editor/BitToggleElement";
import { TrackTurnoutLeftElement } from "../models/editor/elements/TrackTurnoutLeftElement";
import { TrackTurnoutRightElement } from "../models/editor/elements/TrackTurnoutRightElement";
import ElementPreview from "../models/editor/rendering/ElementPreviewRenderer";
import { ELEMENT_TYPES } from "../models/editor/types/EditorTypes";
import { wsApi } from "../services/wsApi";
import { useEditorSettings } from "../context/EditorSettingsContext";
const ColorsDefault = [
    "#000000", "#ffffff", "#868e96",
    "#f11414", "#fa5252", "#e64980",
    "#be4bdb", "#7950f2", "#4c6ef5",
    "#228be6", "#15aabf", "#12b886",
    "#40c057", "#82c91e", "#fab005",
    "#fd7e14",
];
export default function RightPropertyPanel({ selectedElement, onUpdateSelectedElement, invalidate, editMode }) {
    const trackturnoutleft1 = new TrackTurnoutLeftElement(0, 0);
    trackturnoutleft1.turnoutClosed = true;
    const trackturnoutleft2 = new TrackTurnoutLeftElement(0, 0);
    trackturnoutleft2.turnoutClosed = false;
    const trackturnoutright = new TrackTurnoutRightElement(0, 0);
    const [properties, setProperties] = useState(null);
    const [helpOpened, setHelpOpened] = useState("help");
    const { settings, updateSettings } = useEditorSettings();
    const { colorScheme } = useMantineColorScheme();
    useEffect(() => {
        //
        if (editMode) {
            if (selectedElement != null) {
                setProperties(selectedElement.getEditableProperties());
            }
            else {
                setProperties(null);
            }
        }
        else {
            setProperties(null);
        }
    }, [selectedElement, editMode]);
    const helpHtml = useMemo(() => {
        if (!selectedElement)
            return "";
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
    const getPreviewTurnout = function (elem, closed) {
        if (selectedElement) {
            if (selectedElement.type === ELEMENT_TYPES.TRACK_TURNOUT_LEFT) {
                const t = new TrackTurnoutLeftElement(0, 0);
                t.rotation = selectedElement.rotation;
                t.turnoutClosed = closed;
                return t;
            }
            else if (selectedElement.type === ELEMENT_TYPES.TRACK_TURNOUT_RIGHT) {
                const t = new TrackTurnoutRightElement(0, 0);
                t.rotation = selectedElement.rotation;
                t.turnoutClosed = closed;
                return t;
            }
        }
        return trackturnoutleft1;
    };
    const handleChange = (prop, rawValue) => {
        if (selectedElement != null) {
            switch (prop.type) {
                case "number":
                    if (prop.validate) {
                        const isValid = prop.validate(rawValue);
                        selectedElement[prop.key] = parseInt(rawValue);
                    }
                    else {
                        selectedElement[prop.key] = parseInt(rawValue);
                    }
                    break;
                case "boolean":
                    selectedElement[prop.key] = Boolean(rawValue);
                    break;
                case "checkbox":
                    selectedElement[prop.key] = (rawValue) ? "checked" : "";
                    break;
                default:
                    selectedElement[prop.key] = rawValue;
                    break;
            }
            onUpdateSelectedElement(null);
        }
    };
    if (editMode) {
        return (<ScrollArea h="100%" style={{ margin: 0, padding: 0 }}>
        <div className="property-panel">
          <Text c="blue" tt="capitalize">Properties</Text>
          {!selectedElement &&
                (<>
                <Card withBorder p="xs">
                  <Group mb="sm">
                    <Text fw={500}>Editor</Text>
                  </Group>
                  <Checkbox mb={4} label="Show occupacy address" checked={settings.showOccupacySensorAddress} onChange={(e) => updateSettings({ showOccupacySensorAddress: e.currentTarget.checked })}/>
                  <Checkbox mb={4} label="Show sensor address" checked={settings.showSensorAddress} onChange={(e) => updateSettings({ showSensorAddress: e.currentTarget.checked })}/>

                  <Checkbox mb={4} label="Show turnout address" checked={settings.showTurnoutAddress} onChange={(e) => updateSettings({ showTurnoutAddress: e.currentTarget.checked })}/>

                  <Checkbox mb={4} label="Show signal address" checked={settings.showSignalAddress} onChange={(e) => updateSettings({ showSignalAddress: e.currentTarget.checked })}/>

                  <Checkbox mb={4} label="Show grid" checked={settings.showGrid} onChange={(e) => updateSettings({ showGrid: e.currentTarget.checked })}/>
                </Card>
              </>)}

          {selectedElement && properties && properties.map((prop) => (<div key={prop.key} style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: 12,
                    marginLeft: 0,
                    marginRight: 16
                }}>
              <Card withBorder p="xs">
                {prop.type === "string" && (<>
                    {/* <label>{prop.label}</label> */}
                    <TextInput label={prop.label} readOnly={prop.readonly} type="text" value={selectedElement[prop.key] ?? ""} onChange={(e) => handleChange(prop, e.target.value)}/>
                  </>)}

                {prop.type === "number" && (<>
                    {/* <label>{prop.label}</label> */}
                    <NumberInput label={prop.label} disabled={prop.readonly} 
                //type="number"
                value={selectedElement[prop.key] ?? 0} onChange={(e) => handleChange(prop, e)}/>
                  </>)}

                {prop.type === "boolean" && (<>
                    <label>{prop.label}</label>
                    <input aria-label="input Field" disabled={prop.readonly} type="checkbox" checked={Boolean(selectedElement[prop.key])} onChange={(e) => handleChange(prop, e.target.checked)}/>
                  </>)}
                {prop.type === "checkbox" && (<Checkbox label={prop.label} checked={Boolean(selectedElement[prop.key])} onChange={(e) => handleChange(prop, e.target.checked)}/>)}

                {prop.type == "colorpicker" && (<>
                    <label>{prop.label}</label>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(8, 24px)",
                        gap: 8,
                        marginTop: 8,
                    }}>
                      {ColorsDefault.map((color) => {
                        const selectedColor = (selectedElement[prop.key] ?? "").toLowerCase();
                        const isSelected = selectedColor === color.toLowerCase();
                        return (<div key={color} onClick={() => {
                                if (!prop.readonly) {
                                    handleChange(prop, color);
                                }
                            }} style={{
                                width: 32,
                                padding: 3,
                                border: isSelected ? "2px solid #339af0" : "2px solid transparent",
                                borderRadius: 2,
                                cursor: prop.readonly ? "default" : "pointer",
                            }}>
                            <ColorSwatch color={color} size={22}/>
                          </div>);
                    })}
                    </div>
                  </>)}

                {prop.type === "bittoggle" && (<Group>
                    <Group>
                      <ElementPreview element={getPreviewTurnout(selectedElement, true)} label="Closed" width={40} height={40} onClick={() => {
                        const t = selectedElement;
                        const data = { address: t.turnouAddress, closed: t.turnoutClosedValue };
                        console.log("WSAPI:", data);
                        wsApi.setTurnout(data);
                    }}/>
                      <BitToggleElement value={selectedElement[prop.key]} onChange={(e) => handleChange(prop, e)}/>
                    </Group>
                    <Group>
                      <ElementPreview element={getPreviewTurnout(selectedElement, false)} label="Opened" width={40} height={40} onClick={() => {
                        const t = selectedElement;
                        const data = { address: t.turnouAddress, closed: !t.turnoutClosedValue };
                        wsApi.setTurnout(data);
                    }}/>
                      <BitToggleElement value={!(selectedElement[prop.key])} onChange={(e) => handleChange(prop, (!e))}/>
                    </Group>

                  </Group>)}

              </Card>

            </div>))}

          {(<Accordion value={helpOpened} onChange={setHelpOpened} mr={0} mt={10} chevronPosition="right" variant="contained">
              <Accordion.Item value="help">
                <Accordion.Control style={(theme) => ({
                    backgroundColor: colorScheme === "dark"
                        ? theme.colors.dark[8]
                        : theme.colors.gray[3],
                })}>
                  <Group gap={0}>
                    <Text>❓</Text>
                    <Text>Help</Text>
                  </Group>

                </Accordion.Control>
                <Accordion.Panel>
                  <div dangerouslySetInnerHTML={{ __html: selectedElement ? selectedElement?.getHelp() : "GENERAL HELP" }}/>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>)}


        </div>



      </ScrollArea>);
    }
    return (<Text>Control Mode</Text>);
}
