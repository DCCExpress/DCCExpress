import { ITrackLayoutFile } from "../types/EditorTypes";

export const sampleLayout: ITrackLayoutFile = {
  version: 1,
  name: "Teszt pálya",
  description: "Első mintapálya",
  settings: {
    gridSize: 40,
    snapToGrid: true,
    showGrid: true,
    backgroundColor: "#0f172a",
    defaultRotationStep: 45,
  },
  layers: {
    track: {
      name: "track",
      elements: [],
    },
    buildings:{
      name: "building",
      elements: [],
    }


  }





};