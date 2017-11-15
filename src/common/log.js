// @flow
import type { Log } from '../external';
import type { NpmConfig, UserConfig } from '../annotations';
import * as r from 'ramda';
import { whileNil } from './utils';

export type { Log };

export default (
  npmConfig: NpmConfig,
  userConfig: UserConfig,
  npmlog: Log,
): Log => {
  const loglevel: string = whileNil(
    () => r.prop('loglevel', userConfig),
    () => r.prop('loglevel', npmConfig),
    r.always('warn'),
  )(null);

  const createMethod = (method: string) => (
    prefix: string,
    message: string,
    ...rest: Array<any>
  ) => {
    if (npmlog.level !== loglevel) {
      npmlog.level = loglevel;
    }
    const fn: typeof npmlog.info = npmlog[method];
    fn(prefix, message, ...rest);
  };

  return {
    error: createMethod('error'),
    warn: createMethod('warn'),
    info: createMethod('info'),
    log: createMethod('log'),
    http: createMethod('http'),
    verbose: createMethod('verbose'),
    silly: createMethod('silly'),
    level: loglevel,
  };
};
