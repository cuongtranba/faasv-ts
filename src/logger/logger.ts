import pino, { Logger, LoggerOptions } from "pino";
let _log: Logger<LoggerOptions> = null;

if (_log == null) {
  _log = pino();
}

export { _log as log };
