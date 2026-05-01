import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";

type LocoFunction = {
  id: string;
  number: number;
  name: string;
  icon: string;
  momentary: boolean;
};

type Loco = {
  id: string;
  name: string;
  address: number;
  maxSpeed: number;
  invert: boolean;
  image?: string;
  functions: LocoFunction[];
};

export const locoRoutes = Router();

function resolveLocosFilePath() {
  const cwd = process.cwd();

  const candidate1 = path.resolve(cwd, "data", "locos.json");
  const candidate2 = path.resolve(cwd, "server", "data", "locos.json");

  return { candidate1, candidate2 };
}

export async function readLocos(): Promise<Loco[]> {
  const { candidate1, candidate2 } = resolveLocosFilePath();

  try {
    const content = await fs.readFile(candidate1, "utf8");
    return JSON.parse(content) as Loco[];
  } catch {
    const content = await fs.readFile(candidate2, "utf8");
    return JSON.parse(content) as Loco[];
  }
}

async function writeLocos(locos: Loco[]) {
  const { candidate1, candidate2 } = resolveLocosFilePath();

  try {
    await fs.mkdir(path.dirname(candidate1), { recursive: true });
    await fs.writeFile(candidate1, JSON.stringify(locos, null, 2), "utf8");
  } catch {
    await fs.mkdir(path.dirname(candidate2), { recursive: true });
    await fs.writeFile(candidate2, JSON.stringify(locos, null, 2), "utf8");
  }
}

locoRoutes.get("/", async (_req, res) => {
  try {
    const locos = await readLocos();
    res.json(locos);
  } catch (error) {
    console.error("GET /api/locos error:", error);
    res.status(500).json({
      success: false,
      message: "Nem sikerült beolvasni a mozdonyokat.",
    });
  }
});

locoRoutes.put("/", async (req, res) => {
  try {
    const locos = req.body as Loco[];

    if (!Array.isArray(locos)) {
      res.status(400).json({
        success: false,
        message: "A kérés törzsének mozdony tömbnek kell lennie.",
      });
      return;
    }

    await writeLocos(locos);

    res.json({
      success: true,
      count: locos.length,
    });
  } catch (error) {
    console.error("PUT /api/locos error:", error);
    res.status(500).json({
      success: false,
      message: "Nem sikerült elmenteni a mozdonyokat.",
    });
  }
});