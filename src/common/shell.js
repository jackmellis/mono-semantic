// @flow
import type { Shelljs, Log } from '../external';

export type Shell = (
  cmd: string,
  options?: {
    async?: boolean,
    silent?: boolean,
  },
) => string;

export default (
  shelljs: Shelljs,
  log: Log
): Shell => {
  return (cmd, options = {}) => {
    log.verbose('shell', 'exectuting command: %s', cmd);

    const result = shelljs.exec(cmd, options);

    if (result.code === 0) {
      return result.stdout;
    }
    throw new Error(result.stderr);
  };
};
