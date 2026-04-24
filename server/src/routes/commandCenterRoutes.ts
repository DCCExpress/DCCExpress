import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { CommandCenterType } from "../../../common/src/types.js";

//export type CommandCenterType = "z21" | "dcc-ex-tcp" | "dcc-ex-serial" | "simulator";

export interface CommandCenterConfig {
  name: string;
  type: CommandCenterType;
  simulator: {};
  z21: { host?: string; port?: number };
  dccexTcp: { host?: string; port?: number };
  dccexSerial: { serialPort?: string; baudRate?: number };
  autoConnect?: boolean;
}

export const commandCenterRoutes = Router();

function resolveCommandCentersFilePath() {
  const cwd = process.cwd();

  const candidate1 = path.resolve(cwd, "data", "command-centers.json");
  const candidate2 = path.resolve(cwd, "server", "data", "command-centers.json");

  return { candidate1, candidate2 };
}

export let CurrentCommandCenterConfig: CommandCenterConfig | null = null;
let cbCommandCenterConfigLoaded: (conf: CommandCenterConfig | null) => void;
export function setCommandCenterConfigLoadedCallback(cb: (conf: CommandCenterConfig | null) => void) {
  cbCommandCenterConfigLoaded = cb;
}

export async function readCommandCenter(): Promise<CommandCenterConfig | null> {
  const { candidate1, candidate2 } = resolveCommandCentersFilePath();

  try {
    console.log("COMMAND CENTER:", candidate1);
    const content = await fs.readFile(candidate1, "utf8");
    CurrentCommandCenterConfig = JSON.parse(content) as CommandCenterConfig;

  }
  catch {
    try {
      const content = await fs.readFile(candidate2, "utf8");
      CurrentCommandCenterConfig = JSON.parse(content) as CommandCenterConfig;
      return CurrentCommandCenterConfig;
    }
    catch {
      CurrentCommandCenterConfig = null;
    }
  }
  if (cbCommandCenterConfigLoaded) {
    cbCommandCenterConfigLoaded(CurrentCommandCenterConfig);
  }
  return CurrentCommandCenterConfig;
}

async function writeCommandCenter(item: CommandCenterConfig) {
  const { candidate1, candidate2 } = resolveCommandCentersFilePath();

  try {
    await fs.mkdir(path.dirname(candidate1), { recursive: true });
    await fs.writeFile(candidate1, JSON.stringify(item, null, 2), "utf8");
  } catch {
    await fs.mkdir(path.dirname(candidate2), { recursive: true });
    await fs.writeFile(candidate2, JSON.stringify(item, null, 2), "utf8");
  }
}

function isValidCommandCenterType(value: unknown): value is CommandCenterType {
  return value === "z21" || value === "dcc-ex-tcp" || value === "dcc-ex-serial" || value === "simulator";
}

function normalizeCommandCenter(input: Partial<CommandCenterConfig>): CommandCenterConfig {
  return {
    name: typeof input.name === "string" ? input.name : "",
    type: isValidCommandCenterType(input.type) ? input.type : "simulator",
    simulator: {},
    z21: {
      host: typeof input.z21?.host === "string" ? input.z21.host : "192.168.1.100",
      port: typeof input.z21?.port === "number" ? input.z21.port : 21105,
    },
    dccexTcp: {
      host: typeof input.dccexTcp?.host === "string" ? input.dccexTcp.host : "",
      port: typeof input.dccexTcp?.port === "number" ? input.dccexTcp.port : 2560,
    },
    dccexSerial: {
      serialPort:
        typeof input.dccexSerial?.serialPort === "string"
          ? input.dccexSerial.serialPort
          : "",
      baudRate:
        typeof input.dccexSerial?.baudRate === "number"
          ? input.dccexSerial.baudRate
          : 115200,
    },
    autoConnect:
      typeof input.autoConnect === "boolean" ? input.autoConnect : false,
  };
}

commandCenterRoutes.get("/", async (_req, res) => {
  try {
    const item = await readCommandCenter();
    res.json(item);
  } catch (error) {
    console.error("GET /api/command-centers error:", error);
    res.status(500).json({
      success: false,
      message: "Nem sikerült beolvasni a parancsközpontot.",
    });
  }
});

commandCenterRoutes.put("/", async (req, res) => {
  try {
    const body = req.body as Partial<CommandCenterConfig>;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({
        success: false,
        message: "A kérés törzsének egy parancsközpont objektumnak kell lennie.",
      });
      return;
    }

    const item = normalizeCommandCenter(body);

    if (!item.name.trim()) {
      res.status(400).json({
        success: false,
        message: "A név megadása kötelező.",
      });
      return;
    }

    await writeCommandCenter(item);

    if (cbCommandCenterConfigLoaded) {
      cbCommandCenterConfigLoaded(item);
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("PUT /api/command-centers error:", error);
    res.status(500).json({
      success: false,
      message: "Nem sikerült elmenteni a parancsközpontot.",
    });
  }
});