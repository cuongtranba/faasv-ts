"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const msg_1 = require("../types/msg");
const gatewayServer = () => {
    let _option = {
        middlewares: [],
        port: "9220",
        queue: null,
    };
    let server = null;
    const app = (0, express_1.default)();
    return {
        withOption: (option) => {
            _option = Object.assign(Object.assign({}, _option), option);
        },
        start: () => {
            var _a;
            if (((_a = _option.middlewares) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                app.use(_option.middlewares);
            }
            app.use(body_parser_1.default.urlencoded({ extended: false }));
            app.use(body_parser_1.default.json());
            app.get("/", (req, res) => {
                res.send("hello world");
            });
            app.post("/", async (req, res, next) => {
                const { body } = req;
                const msg = body;
                try {
                    const result = await _option.queue.Request(msg.subject, msg.payload);
                    return res.send(result);
                }
                catch (e) {
                    if (e instanceof msg_1.IMsgError) {
                        return next(e);
                    }
                    const err = new msg_1.IMsgError("unknown", e.message, msg.subject);
                    return next(err);
                }
            });
            app.use((err, req, res, next) => {
                if (err) {
                    return res.status(500).send(err);
                }
                return next();
            });
            return app.listen(_option.port, () => {
                console.log(`[server]: Server is running at ${_option.port}`);
            });
        },
        stop: (cb) => {
            server.close((err) => {
                _option.queue.Close();
                cb(err);
            });
        },
    };
};
exports.default = gatewayServer;
//# sourceMappingURL=gateway.js.map