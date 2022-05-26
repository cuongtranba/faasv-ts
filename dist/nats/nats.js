"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const nats_1 = require("nats");
const logger_1 = require("../logger/logger");
let _nc = null;
const natQueue = async (opts) => {
    if (_nc == null) {
        _nc = await (0, nats_1.connect)(opts);
    }
    return {
        Close: async () => {
            await _nc.drain();
            await _nc.close();
            logger_1.log.info("[NAT] closed");
        },
        Start: async () => {
            logger_1.log.info(`[queue] queue start: ${_nc.info.host}:${_nc.info.port}`);
            await _nc.closed();
        },
        Publish: (subject, payload) => {
            const jc = (0, nats_1.JSONCodec)();
            _nc.publish(subject, jc.encode(payload));
        },
        Request: async (subject, payload) => {
            const jc = (0, nats_1.JSONCodec)();
            const result = await _nc.request(subject, jc.encode(payload));
            const de = (0, nats_1.JSONCodec)();
            return de.decode(result.data);
        },
        Subscribe: async (handler) => {
            var e_1, _a;
            const sub = _nc.subscribe(handler.Subject, {
                queue: handler.Queue,
            });
            try {
                for (var sub_1 = __asyncValues(sub), sub_1_1; sub_1_1 = await sub_1.next(), !sub_1_1.done;) {
                    const msg = sub_1_1.value;
                    const de = (0, nats_1.JSONCodec)();
                    const payload = de.decode(msg.data);
                    const result = await handler.Func(payload);
                    if (msg.reply) {
                        const re = (0, nats_1.JSONCodec)();
                        _nc.publish(msg.reply, re.encode(result));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (sub_1_1 && !sub_1_1.done && (_a = sub_1.return)) await _a.call(sub_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        },
    };
};
exports.default = natQueue;
//# sourceMappingURL=nats.js.map