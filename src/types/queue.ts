import { IHandler } from "./handler";

export interface IQueue {
  Publish: <T, V>(subject: string, payload: T) => Promise<void> | void;
  Subscribe: <T, V>(handler: IHandler<T, V>) => Promise<void> | void;
  Request: <T, V>(subject: string, payload: T) => Promise<V> | V;
  Close: () => Promise<void> | void;
  Start: () => Promise<void> | void;
}
