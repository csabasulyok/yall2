import morgan, { type TokenIndexer } from 'morgan';
import { type IncomingMessage, type ServerResponse } from 'node:http';
import yall from './yall.js';

export type MorganMiddleware = (req, res, next) => void;

/**
 * YALL Morgan middleware settings
 */
export type YallMorganConfig = {
  readLevel: string; // log level used for GET and HEAD calls. Default: debug
  writeLevel: string; // log level used for all other calls. Default: info
};

/**
 * Build Express middleware using morgan, but integrating with YALL settings
 */
export function yallMorgan(config?: Partial<YallMorganConfig>): MorganMiddleware {
  // default config values
  const finalConfig: YallMorganConfig = {
    readLevel: 'debug',
    writeLevel: 'info',
    ...config,
  };

  let morganLevel = 'info';

  // custom morgan message format, setting log level based on request method
  const morganFormatter = (tokens: TokenIndexer, req: IncomingMessage, res: ServerResponse) => {
    morganLevel = req.method === 'GET' || req.method === 'HEAD' ? finalConfig.readLevel : finalConfig.writeLevel;
    const contentLength = res.getHeader('content-length') ?? 0;
    const responseTime = tokens['response-time'](req, res);
    return `Received ${req.method} ${req.url} ${res.statusCode} - ${contentLength}B ${responseTime}ms`;
  };

  // custom morgan middleware coupled with winston
  return morgan(morganFormatter, {
    stream: {
      write: (message) => {
        yall.stackInfo = 'express';
        yall.logger.log(morganLevel, message.trimEnd());
      },
    },
  });
}
