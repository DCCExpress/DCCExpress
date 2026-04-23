import { Card, Group, Modal, Stack } from "@mantine/core";
import { ELEMENT_TYPES } from "../../models/editor/types/EditorTypes";
import ElementPreview from "../../models/editor/rendering/ElementPreviewRenderer";
import { TrackElement } from "../../models/editor/elements/TrackElement";
import { TrackEndElement } from "../../models/editor/elements/TrackEndElement";
import { TrackCornerElement } from "../../models/editor/elements/TrackCornerElement";
import { TrackCurveElement } from "../../models/editor/elements/TrackCurveElement";
import { TrackTurnoutLeftElement } from "../../models/editor/elements/TrackTurnoutLeftElement";
import { TrackTurnoutRightElement } from "../../models/editor/elements/TrackTurnoutRightElement";
import { TrackTurnoutTwoWayElement } from "../../models/editor/elements/TrackTurnoutTwoWayElement";
import TrackTurnoutDoubleElement from "../../models/editor/elements/TrackTurnoutDoubleElement";
import { TrackSensorElement } from "../../models/editor/elements/TrackSensorElement";
import { ButtonElement } from "../../models/editor/elements/ButtonElement";
import { ClockElement } from "../../models/editor/elements/ClockElement";
import { TreeElement } from "../../models/editor/elements/TreeElement";
import { BlockElement } from "../../models/editor/elements/BlockElement";
import { TrackSignalElement } from "../../models/editor/elements/TrackSignalElement";
import { AudioButtonElement } from "../../models/editor/elements/AudioButtonElement";
import { RouteButtonElement } from "../../models/editor/elements/RouteButtonElement";
import { TrackCrossingElement } from "../../models/editor/elements/TrackCrossingElement";
export default function ElementPickerDialog({ opened, onClose, onPick, }) {
    const track = new TrackElement(0, 0);
    const trackend = new TrackEndElement(0, 0);
    const trackcorner = new TrackCornerElement(0, 0);
    const trackcurve = new TrackCurveElement(0, 0);
    const trackcrossing = new TrackCrossingElement(0, 0);
    const trackturnoutleft = new TrackTurnoutLeftElement(0, 0);
    const trackturnoutright = new TrackTurnoutRightElement(0, 0);
    const trackturnouttwoway = new TrackTurnoutTwoWayElement(0, 0);
    const trackturnoutdouble = new TrackTurnoutDoubleElement(0, 0);
    const tracksensor = new TrackSensorElement(0, 0);
    const button = new ButtonElement(0, 0);
    const audiobutton = new AudioButtonElement(0, 0);
    const routebutton = new RouteButtonElement(0, 0);
    const clock = new ClockElement(0, 0);
    clock.scale = 0.28;
    const tree = new TreeElement(0, 0);
    const block = new BlockElement(0, 0);
    const signal2 = new TrackSignalElement(0, 0);
    signal2.aspect = 2;
    const signal3 = new TrackSignalElement(0, 0);
    signal3.aspect = 3;
    const signal4 = new TrackSignalElement(0, 0);
    signal4.aspect = 4;
    return (<Modal size={"xl"} opened={opened} onClose={onClose} title="Elem kiválasztása" centered>

      <Stack p={2} gap="xs">
        <Card padding="xs" withBorder>
          <Group>
            <ElementPreview element={track} label="Track" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK);
            onClose();
        }}/>
            <ElementPreview element={trackend} label="Track End" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_END);
            onClose();
        }}/>
            <ElementPreview element={trackcorner} label="Corner" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_CORNER);
            onClose();
        }}/>
            <ElementPreview element={trackcurve} label="Curve" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_CURVE);
            onClose();
        }}/>
            <ElementPreview element={trackcrossing} label="Crossing" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_CROSSING);
            onClose();
        }}/>
          </Group>
          </Card>

          <Card>
            <Group>
            <ElementPreview element={trackturnoutleft} label="Turnout Left" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_TURNOUT_LEFT);
            onClose();
        }}/>
            <ElementPreview element={trackturnoutright} label="Turnout Right" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_TURNOUT_RIGHT);
            onClose();
        }}/>

            <ElementPreview element={trackturnouttwoway} label="Turnout Y" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_TURNOUT_TWO_WAY);
            onClose();
        }}/>

            <ElementPreview element={trackturnoutdouble} label="Turnout Double" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_TURNOUT_DOUBLE);
            onClose();
        }}/>
          </Group>
        </Card>

        <Card padding="xs" withBorder>
          <Group>
            <ElementPreview element={signal2} label="Sensor" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_SIGNAL2);
            onClose();
        }}/>
            <ElementPreview element={signal3} label="Sensor" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_SIGNAL3);
            onClose();
        }}/>
            <ElementPreview element={signal4} label="Sensor" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_SIGNAL4);
            onClose();
        }}/>
          </Group>
        </Card>

        <Card padding="xs" withBorder>
          <Group>
            <ElementPreview element={tracksensor} label="Sensor" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_SENSOR);
            onClose();
        }}/>
            <ElementPreview element={button} label="Button" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.BUTTON);
            onClose();
        }}/>
            <ElementPreview element={routebutton} label="Route" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.BUTTON_ROUTE);
            onClose();
        }}/>
            <ElementPreview element={audiobutton} label="Audio" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.BUTTON_AUDIO);
            onClose();
        }}/>
            <ElementPreview element={clock} scale={1} label="Clock" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.CLOCK);
            onClose();
        }}/>
            <ElementPreview element={block} label="Block" width={40} height={40} onClick={() => {
            onPick(ELEMENT_TYPES.TRACK_BLOCK);
            onClose();
        }}/>
            
            


          </Group>
        </Card>

      </Stack>
    </Modal>);
}
