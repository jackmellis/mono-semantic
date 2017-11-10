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

    return shelljs.exec(cmd, options);
  };
};
