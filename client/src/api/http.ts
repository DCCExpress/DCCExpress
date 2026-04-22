import { BaseElement } from "../models/editor/core/BaseElement";
import { Layout } from "../models/editor/core/Layout";

import { ELEMENT_TYPES, ElementType, ITrackLayoutFile } from "../models/editor/types/EditorTypes";
import type { Loco } from "../types/loco";

export async function getLocos(): Promise<Loco[]> {
  const response = await fetch("/api/locos");

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni a mozdonyokat.");
  }

  return response.json();
}

export async function saveLocos(locos: Loco[]): Promise<void> {
  const response = await fetch("/api/locos", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(locos),
  });

  if (!response.ok) {
    throw new Error("Nem sikerült elmenteni a mozdonyokat.");
  }
}


export type LayoutElementDto = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation?: number;
  width?: number;
  height?: number;
};

export async function getLayout(): Promise<Layout> {
  const response = await fetch("/api/layout");

  if (!response.ok) {
    throw new Error("Nem sikerült betölteni a pályát.");
  }

  return response.json();
}

export async function saveLayout(elements: Layout): Promise<void> {
  const response = await fetch("/api/layout", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(elements),
  });

  if (!response.ok) {
    throw new Error("Nem sikerült elmenteni a pályát.");
  }
}

//import { TrackElement } from "../models/editor/elements/TrackElement";
//import { TrackEndElement } from "../models/editor/elements/TrackEndElement";

// export function serializeLayout(elements: BaseElement[]): LayoutElementDto[] {
//   return elements.map((el) => ({
//     id: el.id,
//     type: el.type,
//     x: el.x,
//     y: el.y,
//     rotation: el.rotation,
//     width: el.width,
//     height: el.height,
//   }));
// }


// export function deserializeLayout(data: LayoutElementDto[]): BaseElement[] {
//   return data.map((item) => {
//     switch (item.type) {
//       case "track": {
//         const track = new TrackElement(item.x, item.y)
//         //   id: "ghost-track",
//         //   type: ELEMENT_TYPES.TRACK,
//         //   name: "Ghost Track",
//         //   x: 0,
//         //   y: 0,
//         //   rotation: 0,
//         //   rotationStep: 45,
//         //   trackType: "straight",
//         // });
//         return track;
//       }


//       default:
//         throw new Error(`Unknown layout element type: ${item.type}`);
//     }
//   });
// }