import http from "node:http";
import { app, clientDir, distDir } from "./app.js";
import { setupWebSocketServer } from "./ws/wsServer.js";
const PORT = 3000;
const server = http.createServer(app);
setupWebSocketServer(server);
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    console.log(server.address());
    console.log("Dist: ", distDir);
    console.log("ClientDir: ", clientDir);
    console.log("Dist: ", distDir);
});
