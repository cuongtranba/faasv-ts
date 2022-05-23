"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const nats_1 = __importDefault(require("./nats/nats"));
const gateway_1 = __importDefault(require("./server/gateway"));
dotenv_1.default.config({});
const port = process.env.PORT;
const nats = process.env.NATS;
(async () => {
    const queue = await (0, nats_1.default)({ servers: [nats] });
    queue.Subscribe({
        Queue: "worker",
        Subject: "hello",
        Func: (payload) => {
            return {
                name: payload.name,
                message: "hello",
            };
        },
    });
    queue.Start();
    const server = (0, gateway_1.default)();
    server.withOption({
        queue: queue,
        port: port,
    });
    process.on("SIGTERM", () => {
        server.stop(() => {
            console.log("[server]: Server is stopped");
        });
    });
    process.on("SIGINT", () => {
        server.stop(() => {
            console.log("[server]: Server is stopped");
        });
    });
    server.start();
})();
//# sourceMappingURL=index.js.map