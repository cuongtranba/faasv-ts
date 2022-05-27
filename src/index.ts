import dotenv from "dotenv";
import { log } from "./logger/logger";
import natQueue from "./nats/nats";
import gatewayServer from "./server/gateway";
import { studentHandler, userHandler } from "./types/handler";

dotenv.config({});

const port = process.env.PORT;
const nats = process.env.NATS;

(async () => {
  const queue = await natQueue({ servers: [nats] });
  queue.Subscribe(userHandler);
  queue.Subscribe(studentHandler);

  queue.Start();

  const server = gatewayServer();
  server.withOption({
    queue: queue,
    port: port,
  });
  process.on("SIGTERM", () => {
    server.stop(() => {
      log.warn("[server]: Server is stopped");
    });
  });
  process.on("SIGINT", () => {
    server.stop(() => {
      log.warn("[server]: Server is stopped");
    });
  });
  server.start();
})();
