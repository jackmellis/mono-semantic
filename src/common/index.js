// @flow
import type { Fs, Shelljs, Log, CreatePlugins } from '../external';
import type { Env } from '../annotations';

import composeShell from './shell';
import composeConfig from './config';
import composeGetPackages from './getPackages';
import composeWritePackage from './writePackage';
import composeLog from './log';

type Dependencies = {
  userConfig: Object,
  external: {
    fs: Fs,
    shelljs: Shelljs,
    npmlog: Log,
    env: Env,
    createPlugins: CreatePlugins,
  },
};

export default (deps: Dependencies) => {
  let shell = composeShell(
    deps.external.shelljs,
    deps.external.npmlog,
  );

  const config = composeConfig({
    ...deps,
    shell,
  });

  const userConfig = config.getUserConfig();

  const log = composeLog(
    config.npmConfig,
    userConfig,
    deps.external.npmlog
  );

  // now we need to recompose shell using the "official" logger
  shell = composeShell(
    deps.external.shelljs,
    log
  );

  const getPackages = composeGetPackages(
    deps.external.fs,
    userConfig,
    deps.external.npmlog,
    config.rootPackage,
  );

  const writePackage = composeWritePackage(deps.external.fs);

  return {
    log,
    shell,
    config,
    getPackages,
    writePackage,
  };
};
