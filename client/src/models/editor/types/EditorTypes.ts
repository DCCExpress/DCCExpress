import { SensorTypes } from "../elements/TrackSensorElement";
import { TrackSignalElement as TrackSignal2Element } from "../elements/TrackSignalElement";


export const ELEMENT_TYPES = {
  GENERAL: "general",
  ADDRESSED_ELEMENT: "addressedelement",
  TRACK: "track",
  TRACK_END: "trackend",
  TRACK_CORNER: "trackcorner",
  TRACK_CURVE: "trackcurve",
  TRACK_CROSSING: "trackcrossing",
  TRACK_TURNOUT_LEFT: "trackturnoutleft",
  TRACK_TURNOUT_RIGHT: "trackturnoutright",
  TRACK_TURNOUT_DOUBLE: "trackturnoutdouble",
  TRACK_TURNOUT_TWO_WAY: "trackturnouttwoway",
  TRACK_TURNOUT_THREE_WAY: "trackturnouttreeway",
  TRACK_SENSOR: "tracksensor",
  TRACK_SIGNAL2: "tracksignal2",
  TRACK_SIGNAL3: "tracksignal3",
  TRACK_SIGNAL4: "tracksignal4",
  TRACK_BLOCK: "trackblock",
  BUTTON: "button",
  BUTTON_AUDIO: "audiobutton",
  BUTTON_ROUTE: "routebutton",
  CLOCK: "clcok",
  TREE: "tree",

} as const;

export type ElementType =
  typeof ELEMENT_TYPES[keyof typeof ELEMENT_TYPES];

export type EditorTool =
  | { mode: "cursor", elementType: ElementType }
  | { mode: "draw", elementType: ElementType }
  | { mode: "delete", elementType: ElementType };

export type RotationStep = 0 | 45 | 90;





export interface DrawOptions {
  showOccupancySensorAddress: boolean;
  showSensorAddress: boolean;
  showSignalAddress: boolean;
  showTurnoutAddress: boolean;
  selected?: boolean;
  hovered?: boolean;
  ghost?: boolean;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  overrideX?: number;
  overrideY?: number;
  showHandles?: boolean;
  gridSize?: number;
}

export interface IBaseElement {
  id: string;
  type: ElementType;
  name: string;
  layerName: string;
  x: number;
  y: number;
  rotation: number;
  rotationStep: RotationStep;
  bg: string;
  fg: string;
}

export interface IAddressedElement extends IBaseElement {
  //type: typeof ELEMENT_TYPES.ADDRESSED_ELEMENT;
  address: number,
}

export interface ITrackElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.TRACK;
}

export interface ITrackEndElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.TRACK_END;
}

export interface ITrackCornerElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.TRACK_CORNER;
}

export interface ITrackCurveElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.TRACK_CURVE;
}

export interface ITrackCrossingElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.TRACK_CROSSING;
}

export interface ITrackTurnoutLeftElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.TRACK_TURNOUT_LEFT;
  turnoutAddress: number;
  turnoutClosedValue: boolean;
}

export interface ITrackTurnoutRightElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.TRACK_TURNOUT_RIGHT;
  turnoutAddress: number;
  turnoutClosedValue: boolean;
}

export interface ITrackTurnoutTwoWayElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.TRACK_TURNOUT_TWO_WAY;
}

export interface ITrackTurnoutDoubleElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.TRACK_TURNOUT_DOUBLE;
  turnout1Address: number;
  turnout2Address: number;
}

export interface ITrackTurnoutThreeWayElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.TRACK_TURNOUT_THREE_WAY;
  turnout1Address: number;
  turnout2Address: number;
}

export interface ITrackSensorElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.TRACK_SENSOR;
  kind: SensorTypes;
  colorOn: string;
  colorOff: string;
  // textOn: string;
  // textOff: string;
}

export interface IButtonElement extends IAddressedElement {
  type: typeof ELEMENT_TYPES.BUTTON;
  colorOn: string;
  colorOff: string;
  textOn: string;
  textOff: string;
}


export interface IAudioButtonElement extends IBaseElement {
  type: typeof ELEMENT_TYPES.BUTTON_AUDIO;
  colorOn: string;
  fileName: string;
  label: string;
}

export interface IRouteButtonElement extends IBaseElement {
  type: typeof ELEMENT_TYPES.BUTTON_ROUTE;
  colorOn: string;
  label: string;
}


export interface IClockElement extends IBaseElement {
  type: typeof ELEMENT_TYPES.CLOCK;
}

export interface IBlockElement extends IBaseElement {
  type: typeof ELEMENT_TYPES.TRACK_BLOCK;
  text: string;
  length: number;
  textColor: string;
  locoAddress: number;
  sensorAddress: number;
}

export interface ITreeElement extends IBaseElement {
  type: typeof ELEMENT_TYPES.TREE;
}

export interface ITrackSignalElement extends IBaseElement {
  type: typeof ELEMENT_TYPES.TRACK_SIGNAL2;
  aspect: number;
}
// export interface ITrackSignal3Element extends IBaseElement {
//   type: typeof ELEMENT_TYPES.TRACK_SIGNAL2;
//   aspect: number;
// }

export type EditorElementData =
  | ITrackElement
  | ITrackEndElement
  | ITrackCornerElement
  | ITrackCurveElement
  | ITrackCrossingElement
  | ITrackTurnoutLeftElement
  | ITrackTurnoutRightElement
  | ITrackTurnoutTwoWayElement
  | ITrackTurnoutDoubleElement
  | ITrackTurnoutThreeWayElement
  | ITrackSensorElement
  | IButtonElement
  | IAudioButtonElement
  | IRouteButtonElement
  | IClockElement
  | IBlockElement
  | ITreeElement
  | ITrackSignalElement
  ;
  ;
  // | ITrackSignal3Element
  // | ITrackSignal4Element
  // ;
//
export interface IEditorSettings {
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  backgroundColor: string;
  defaultRotationStep: RotationStep;
}



export interface ILayer {
  name: string;
  elements: EditorElementData[];
}
export interface IEditorLayers {
  track: ILayer;
  buildings: ILayer;
}
export interface ITrackLayoutFile {
  version: number;
  name: string;
  description?: string;
  settings: IEditorSettings;
  //elements: any[];
  layers: IEditorLayers
}