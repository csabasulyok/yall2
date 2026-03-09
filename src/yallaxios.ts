import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import yall from './yall.js';

/**
 * YALL axios middleware settings
 */
export type YallAxiosConfig = {
  readLevel: string; // log level used for GET and HEAD calls. Default: debug
  writeLevel: string; // log level used for all other calls. Default: info
};

/**
 * Convert axios response to displayable message
 */
function responseToMessage(res: AxiosResponse): string {
  const req = res.config;

  const sendTime = Number(req.headers.sendTime);
  const elapsedTime = Date.now() - sendTime;
  const contentLengthHeader = res.headers['content-length'] as string | undefined;
  const length = contentLengthHeader ?? (res.data as string)?.length;
  const url = `${req.baseURL ?? ''}${req.url ?? ''}`;
  const message = `Send ${(req.method ?? 'UNKNOWN').toUpperCase()} ${url} - ${res.status} ${length} ${elapsedTime}ms`;

  return message;
}

/**
 * Decorate Axios instance with YALL logging
 */
export function yallAxiosConnect(instance: AxiosInstance, config?: Partial<YallAxiosConfig>): AxiosInstance {
  // default config values
  const finalConfig: YallAxiosConfig = {
    readLevel: 'debug',
    writeLevel: 'info',
    ...config,
  };

  const onRequest = <D>(req: InternalAxiosRequestConfig<D>) => {
    req.headers.sendTime = Date.now().toString();
    return req;
  };

  const onResponse = (res: AxiosResponse) => {
    const req = res.config;

    const method = (req.method ?? 'UNKNOWN').toUpperCase();
    const level = method === 'GET' || method === 'HEAD' ? finalConfig.readLevel : finalConfig.writeLevel;

    yall.stackInfo = 'axios';
    yall.logger.log(level, responseToMessage(res));

    return res;
  };

  const onError = (error: unknown) => {
    yall.stackInfo = 'axios';

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError?.response?.config) {
        yall.logger.warn(responseToMessage(axiosError.response));
      } else {
        yall.logger.warn(`Axios error: ${axiosError}`);
      }
    } else {
      yall.logger.error(`Unknown error ${error}`);
    }
    throw error;
  };

  instance.interceptors.request.use(onRequest);
  instance.interceptors.response.use(onResponse, onError);

  return instance;
}
