import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
export const commandCenterRoutes = Router();
function resolveCommandCentersFilePath() {
    const cwd = process.cwd();
    const candidate1 = path.resolve(cwd, "data", "command-centers.json");
    const candidate2 = path.resolve(cwd, "server", "data", "command-centers.json");
    return { candidate1, candidate2 };
}
async function readCommandCenters() {
    const { candidate1, candidate2 } = resolveCommandCentersFilePath();
    try {
        const content = await fs.readFile(candidate1, "utf8");
        return JSON.parse(content);
    }
    catch {
        try {
            const content = await fs.readFile(candidate2, "utf8");
            return JSON.parse(content);
        }
        catch {
            return [];
        }
    }
}
async function writeCommandCenters(items) {
    const { candidate1, candidate2 } = resolveCommandCentersFilePath();
    try {
        await fs.mkdir(path.dirname(candidate1), { recursive: true });
        await fs.writeFile(candidate1, JSON.stringify(items, null, 2), "utf8");
    }
    catch {
        await fs.mkdir(path.dirname(candidate2), { recursive: true });
        await fs.writeFile(candidate2, JSON.stringify(items, null, 2), "utf8");
    }
}
commandCenterRoutes.get("/", async (_req, res) => {
    try {
        const items = await readCommandCenters();
        res.json(items);
    }
    catch (error) {
        console.error("GET /api/command-centers error:", error);
        res.status(500).json({
            success: false,
            message: "Nem sikerült beolvasni a parancsközpontokat.",
        });
    }
});
commandCenterRoutes.put("/", async (req, res) => {
    try {
        const items = req.body;
        if (!Array.isArray(items)) {
            res.status(400).json({
                success: false,
                message: "A kérés törzsének parancsközpont tömbnek kell lennie.",
            });
            return;
        }
        await writeCommandCenters(items);
        res.json({
            success: true,
            count: items.length,
        });
    }
    catch (error) {
        console.error("PUT /api/command-centers error:", error);
        res.status(500).json({
            success: false,
            message: "Nem sikerült elmenteni a parancsközpontokat.",
        });
    }
});
