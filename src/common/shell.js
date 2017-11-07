// @flow
import typeof ShellJs from 'shelljs';
import typeof Npmlog from 'npmlog';

export type Shell = (
  cmd: string,
  options?: {
    async?: boolean,
    silent?: boolean,
  },
) => string;

export default (
  shelljs: ShellJs,
  log: Npmlog
): Shell => {
  return (cmd, options = {}) => {
    log.verbose('shell', 'exectuting command: %s', cmd);

    return shelljs.exec(cmd, options);
  };
};
