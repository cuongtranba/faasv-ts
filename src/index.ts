import dotenv from "dotenv";
import { log } from "./logger/logger";
import natQueue from "./nats/nats";
import gatewayServer from "./server/gateway";

dotenv.config({});

const port = process.env.PORT;
const nats = process.env.NATS;

(async () => {
  const queue = await natQueue({ servers: [nats] });
  queue.Subscribe({
    Queue: "worker",
    Subject: "hello",
    Func: (payload: { name: string }) => {
      return {
        name: payload.name,
        message: "hello" + payload.name,
      };
    },
  });

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
