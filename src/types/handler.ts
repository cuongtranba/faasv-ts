import natQueue from "../nats/nats";

export interface IHandler<T = any, V = any> {
  Subject: string;
  Queue: string;
  Func: (req: T) => Promise<V> | V;
  Call?: (req: T) => Promise<V> | V;
}

export const withCaller = <T, V>(h: IHandler<T, V>): IHandler<T, V> => {
  h.Call = async (req: T) => {
    const nat = await natQueue();
    const res = await nat.Request<T, V>(h.Subject, req);
    return res;
  };
  return h;
};

export const userHandler: IHandler<{ name: string }, { age: string }> =
  withCaller({
    Subject: "user",
    Queue: "worker",
    Func: (req: { name: string }) => {
      return {
        age: "200",
      };
    },
  });

export const studentHandler: IHandler<{ name: string }, { age: string }> =
  withCaller({
    Subject: "student",
    Queue: "worker",
    Func: async (req: { name: string }) => {
      const result = await userHandler.Call({ name: "test001" });
      return {
        age: result.age,
      };
    },
  });
