import { bufferToHex, UdpClient } from "./udpClient.js";

async function main() {

  const udp = new UdpClient({
    host: "192.168.1.70",
    port: 21105,
    timeoutMs: 2000,
    debug: true,
  });

  udp.on("message", (message) => {
    console.log(
      "ASYNC UDP:",
      message.remote.address,
      message.remote.port,
      bufferToHex(message.data)
    );
  });

  await udp.open();

  console.log("UDP client opened");

  // Itt később Z21 parancsot küldünk.
  // Egyelőre csak nyitva tartjuk.
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});