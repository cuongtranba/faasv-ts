import bodyParser from "body-parser";
import express, { Express, NextFunction, Request, Response } from "express";
import { Server } from "http";
import { log } from "../logger/logger";
import { IMsg, IMsgError as IMsgError } from "../types/msg";
import {
  closeCallBack as closeCallback,
  IServerOptions,
} from "../types/server";

const gatewayServer = () => {
  let _option: IServerOptions = {
    middlewares: [],
    port: "9220",
    queue: null,
  };
  let server: Server = null;
  const app: Express = express();

  return {
    withOption: (option?: IServerOptions) => {
      _option = { ..._option, ...option };
    },
    start: () => {
      if (_option.middlewares?.length > 0) {
        app.use(_option.middlewares);
      }

      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(bodyParser.json());

      app.get("/", (req: Request, res: Response) => {
        res.send("hello world");
      });

      app.post("/", async (req: Request, res: Response, next: NextFunction) => {
        const { body } = req;
        const msg = body as IMsg;
        try {
          const result = await _option.queue.Request(msg.subject, msg.payload);
          return res.send(result);
        } catch (e) {
          log.error(e, `payload: ${JSON.stringify(msg)}`);
          return next(e);
        }
      });
      app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        if (err) {
          if (err instanceof IMsgError) {
            return res.status(500).json(err);
          }
          return res
            .status(500)
            .json(new IMsgError("unknown", err.message, req.body.subject));
        }
        return next();
      });
      server = app.listen(_option.port, () => {
        log.info(`[server]: Server is running at ${_option.port}`);
      });
      return server;
    },
    stop: (cb: closeCallback) => {
      server.close((err) => {
        const queueClosePromise = _option.queue.Close() as Promise<void>;
        queueClosePromise.then(() => {
          cb(err);
        });
      });
    },
  };
};

export default gatewayServer;
