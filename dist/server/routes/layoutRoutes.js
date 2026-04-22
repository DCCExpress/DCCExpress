import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
export const layoutRoutes = Router();
function resolveLayoutFilePath() {
    const cwd = process.cwd();
    const candidate1 = path.resolve(cwd, "data", "layout.json");
    const candidate2 = path.resolve(cwd, "server", "data", "layout.json");
    return { candidate1, candidate2 };
}
async function readLayout() {
    const { candidate1, candidate2 } = resolveLayoutFilePath();
    try {
        const content = await fs.readFile(candidate1, "utf8");
        return JSON.parse(content);
    }
    catch {
        const content = await fs.readFile(candidate2, "utf8");
        return JSON.parse(content);
    }
}
async function writeLayout(elements) {
    const { candidate1, candidate2 } = resolveLayoutFilePath();
    try {
        await fs.mkdir(path.dirname(candidate1), { recursive: true });
        await fs.writeFile(candidate1, JSON.stringify(elements, null, 2), "utf8");
    }
    catch {
        await fs.mkdir(path.dirname(candidate2), { recursive: true });
        await fs.writeFile(candidate2, JSON.stringify(elements, null, 2), "utf8");
    }
}
layoutRoutes.get("/", async (_req, res) => {
    try {
        const elements = await readLayout();
        res.json(elements);
    }
    catch (error) {
        console.error("GET /api/layout error:", error);
        res.status(500).json({
            success: false,
            message: "Nem sikerült beolvasni a pályát.",
        });
    }
});
layoutRoutes.put("/", async (req, res) => {
    try {
        // const elements = req.body as LayoutElementDto[];
        // if (!Array.isArray(elements)) {
        //   res.status(400).json({
        //     success: false,
        //     message: "A kérés törzsének pályaelem tömbnek kell lennie.",
        //   });
        //   return;
        // }
        const elements = req.body;
        await writeLayout(elements);
        res.json({
            success: true,
            count: elements.length,
        });
    }
    catch (error) {
        console.error("PUT /api/layout error:", error);
        res.status(500).json({
            success: false,
            message: "Nem sikerült elmenteni a pályát.",
        });
    }
});
