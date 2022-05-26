import natQueue from "../nats/nats";

export interface IHandler<T, V> {
  Subject: string;
  Queue: string;
  Func: (req: T) => Promise<V> | V;
}

const userHandler: IHandler<{ name: string }, { age: string }> = {
  Subject: "hello",
  Queue: "worker",
  Func: (req: { name: string }) => {
    return {
      age: "20",
    };
  },
};

type getTypeReq<T> = T extends IHandler<infer U, infer _> ? U : never;
type getTypeRes<T> = T extends IHandler<infer _, infer V> ? V : never;

type callerFunc = <T>(
  req: T extends IHandler<infer U, infer _> ? U : never
) => Promise<T extends IHandler<infer _, infer V> ? V : never>;

const caller = async <T>(
  req: T extends IHandler<infer U, infer _> ? U : never
): Promise<T extends IHandler<infer _, infer V> ? V : never> => {
  const nat = await natQueue();
  type TReq = getTypeReq<T>;
  type TRes = getTypeRes<T>;
  const res = await nat.Request<TReq, TRes>("userHandler.Subject", req);
  return res;
};

const result = caller<typeof userHandler>({ name: "cuong" });
