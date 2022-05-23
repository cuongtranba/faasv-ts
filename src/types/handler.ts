export interface IHandler<T, V> {
  Subject: string;
  Queue: string;
  Func: (req: T) => Promise<V> | V;
}
