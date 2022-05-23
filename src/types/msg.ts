export class IMsgError {
  constructor(
    public errorCode: string,
    public message: string,
    public subject: string
  ) {}
}

export interface IMsg {
  subject: string;
  payload: any;
  error?: IMsgError;
}
