import { BaseElement } from "./BaseElement";
import { TrackElement } from "../elements/TrackElement";
import { EditorElementData, ELEMENT_TYPES } from "../types/EditorTypes";
import { TrackCornerElement } from "../elements/TrackCornerElement";
import { TrackEndElement } from "../elements/TrackEndElement";
import { TrackCurveElement } from "../elements/TrackCurveElement";
import { TrackTurnoutLeftElement } from "../elements/TrackTurnoutLeftElement";
import { TrackTurnoutRightElement } from "../elements/TrackTurnoutRightElement";
import TrackTurnoutDoubleElement from "../elements/TrackTurnoutDoubleElement";
import { TrackTurnoutTwoWayElement } from "../elements/TrackTurnoutTwoWayElement";
import { TrackSensorElement } from "../elements/TrackSensorElement";
import { ButtonElement } from "../elements/ButtonElement";
import { ClockElement } from "../elements/ClockElement";
import { BlockElement } from "../elements/BlockElement";
import { TreeElement } from "../elements/TreeElement";
import { TrackSignalElement } from "../elements/TrackSignalElement";
import { AudioButtonElement } from "../elements/AudioButtonElement";
import { RouteButtonElement } from "../elements/RouteButtonElement";
import { TrackCrossingElement } from "../elements/TrackCrossingElement";

export class ElementFactory {
  static create(data: EditorElementData): BaseElement {
    switch (data.type) {
      case ELEMENT_TYPES.TRACK: {
        const track = new TrackElement(data.x, data.y);
        track.id = data.id;
        track.name = data.name;
        track.rotation = data.rotation;
        track.address = data.address;
        track.bg = data.bg;
        track.fg = data.fg;
        return track;
      }

      case ELEMENT_TYPES.TRACK_END: {
        const end = new TrackEndElement(data.x, data.y);
        end.id = data.id;
        end.name = data.name;
        end.rotation = data.rotation;
        end.address = data.address;
        end.bg = data.bg;
        end.fg = data.fg;
        return end;
      }

      case ELEMENT_TYPES.TRACK_CORNER: {
        const corner = new TrackCornerElement(data.x, data.y);
        corner.id = data.id;
        corner.name = data.name;
        corner.rotation = data.rotation;
        corner.address = data.address;
        corner.bg = data.bg;
        corner.fg = data.fg;
        return corner;
      }

      case ELEMENT_TYPES.TRACK_CURVE: {
        const curve = new TrackCurveElement(data.x, data.y);
        curve.id = data.id;
        curve.name = data.name;
        curve.rotation = data.rotation;
        curve.address = data.address;
        curve.bg = data.bg;
        curve.fg = data.fg;
        return curve;
      }

      case ELEMENT_TYPES.TRACK_CROSSING: {
        const curve = new TrackCrossingElement(data.x, data.y);
        curve.id = data.id;
        curve.name = data.name;
        curve.rotation = data.rotation;
        curve.address = data.address;
        curve.bg = data.bg;
        curve.fg = data.fg;
        return curve;
      }

      case ELEMENT_TYPES.TRACK_TURNOUT_LEFT: {
        const tleft = new TrackTurnoutLeftElement(data.x, data.y);
        tleft.id = data.id;
        tleft.name = data.name;
        tleft.rotation = data.rotation;
        tleft.address = data.address;
        tleft.turnoutAddress = data.turnoutAddress,
        tleft.turnoutClosedValue = data.turnoutClosedValue,
        tleft.bg = data.bg;
        tleft.fg = data.fg;
        return tleft;
      }

      case ELEMENT_TYPES.TRACK_TURNOUT_RIGHT: {
        const tright = new TrackTurnoutRightElement(data.x, data.y);
        tright.id = data.id;
        tright.name = data.name;
        tright.rotation = data.rotation;
        tright.address = data.address;
        tright.turnoutAddress = data.turnoutAddress,
        tright.turnoutClosedValue = data.turnoutClosedValue,
        tright.bg = data.bg;
        tright.fg = data.fg;
        return tright;
      }

      case ELEMENT_TYPES.TRACK_TURNOUT_TWO_WAY: {
        const ttw = new TrackTurnoutTwoWayElement(data.x, data.y);
        ttw.id = data.id;
        ttw.name = data.name;
        ttw.rotation = data.rotation;
        ttw.address = data.address;
        ttw.bg = data.bg;
        ttw.fg = data.fg;

        return ttw;
      }

      case ELEMENT_TYPES.TRACK_TURNOUT_DOUBLE: {
        const td = new TrackTurnoutDoubleElement(data.x, data.y);
        td.id = data.id;
        td.name = data.name;
        td.rotation = data.rotation;
        td.address = data.address;
        td.bg = data.bg;
        td.fg = data.fg;
        td.turnout1Address = data.turnout1Address;
        td.turnout2Address = data.turnout2Address;
        return td;
      }


      // case ELEMENT_TYPES.TRACK_TURNOUT_THREE_WAY: {
      //   const td = new TrackTurnoutThreeWayElement(data.x, data.y);
      //   td.id = data.id;
      //   td.rotation = data.rotation;
      //   td.address = data.address;
      //   td.turnout1Address = data.turnout1Address;
      //   td.turnout2Address = data.turnout2Address;
      //   return td;
      // }

      case ELEMENT_TYPES.TRACK_SENSOR: {
        const sensor = new TrackSensorElement(data.x, data.y);
        sensor.id = data.id;
        sensor.name = data.name;
        sensor.rotation = data.rotation;
        sensor.bg = data.bg;
        sensor.fg = data.fg;
        sensor.address = data.address;
        sensor.kind = data.kind;
        sensor.colorOn = data.colorOn;
        sensor.colorOff = data.colorOff;
        // sensor.textOn = data.textOn;
        // sensor.textOff = data.textOff;
        return sensor;
      }

      case ELEMENT_TYPES.TRACK_SIGNAL2:      {
        const signal = new TrackSignalElement(data.x, data.y);
        signal.id = data.id;
        signal.name = data.name;
        signal.rotation = data.rotation;
        return signal;
      }


      case ELEMENT_TYPES.BUTTON: {
        const button = new ButtonElement(data.x, data.y);
        button.id = data.id;
        button.name = data.name;
        button.rotation = data.rotation;
        button.bg = data.bg;
        button.fg = data.fg;
        button.address = data.address;
        button.colorOn = data.colorOn;
        button.colorOff = data.colorOff;
        button.textOn = data.textOn;
        button.textOff = data.textOff;
        return button;
      }

      case ELEMENT_TYPES.BUTTON_AUDIO: {
        const button = new AudioButtonElement(data.x, data.y);
        button.id = data.id;
        button.name = data.name;
        button.rotation = data.rotation;
        button.bg = data.bg;
        button.fg = data.fg;
        button.fileName = data.fileName;
        button.colorOn = data.colorOn;
        button.label = data.label;
        return button;
      }

      case ELEMENT_TYPES.BUTTON_ROUTE: {
        const button = new RouteButtonElement(data.x, data.y);
        button.id = data.id;
        button.name = data.name;
        button.rotation = data.rotation;
        button.bg = data.bg;
        button.fg = data.fg;
        button.colorOn = data.colorOn;
        button.label = data.label;
        return button;
      }

      case ELEMENT_TYPES.CLOCK: {
        const clock = new ClockElement(data.x, data.y);
        clock.id = data.id;
        clock.name = data.name;
        clock.rotation = data.rotation;
        clock.bg = data.bg;
        clock.fg = data.fg;
        return clock;
      }

      case ELEMENT_TYPES.TRACK_BLOCK: {
        const block = new BlockElement(data.x, data.y);
        block.id = data.id;
        block.name = data.name;
        block.rotation = data.rotation;
        block.bg = data.bg;
        block.fg = data.fg;
        block.length = data.length;
        block.sensorAddress = data.sensorAddress;

        return block;
      }

      case ELEMENT_TYPES.TREE: {
        const tree = new TreeElement(data.x, data.y);
        tree.id = data.id;
        tree.name = data.name;
        tree.rotation = data.rotation;
        tree.bg = data.bg;
        tree.fg = data.fg;
        return tree;
      }


      default:
        throw new Error(
          `Unsupported element type: ${(data as { type?: string }).type}`
        );
    }
  }

  static createMany(elements: EditorElementData[]): BaseElement[] {
    return elements.map((e) => this.create(e));
  }
}