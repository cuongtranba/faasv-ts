import { NextFunction, Request, Response } from "express";
import { IQueue } from "./queue";

export type Middleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export interface IServerOptions {
  port?: string;
  middlewares?: Middleware[];
  queue: IQueue;
}

export type closeCallBack = (err?: Error) => void;
