import { connect, ConnectionOptions, JSONCodec, NatsConnection } from "nats";
import { log } from "../logger/logger";
import { IHandler } from "../types/handler";
import { IQueue } from "../types/queue";

let _nc: NatsConnection = null;

const natQueue = async (opts?: ConnectionOptions): Promise<IQueue> => {
  if (_nc == null) {
    _nc = await connect(opts);
  }
  return {
    Close: async () => {
      await _nc.drain();
      await _nc.close();
      log.info("[NAT] closed");
    },
    Start: async () => {
      log.info(`[queue] queue start: ${_nc.info.host}:${_nc.info.port}`);
      await _nc.closed();
    },
    Publish: <T, V>(subject: string, payload: T) => {
      const jc = JSONCodec<T>();
      _nc.publish(subject, jc.encode(payload));
    },
    Request: async <T, V>(subject: string, payload: T): Promise<V> => {
      const jc = JSONCodec<T>();
      const result = await _nc.request(subject, jc.encode(payload));
      const de = JSONCodec<V>();
      return de.decode(result.data);
    },
    Subscribe: async <T, V>(handler: IHandler<T, V>): Promise<void> => {
      const sub = _nc.subscribe(handler.Subject, {
        queue: handler.Queue,
      });
      for await (const msg of sub) {
        const de = JSONCodec<T>();
        const payload = de.decode(msg.data);
        const result = await handler.Func(payload);
        if (msg.reply) {
          const re = JSONCodec<V>();
          _nc.publish(msg.reply, re.encode(result));
        }
      }
    },
  };
};

export default natQueue;
