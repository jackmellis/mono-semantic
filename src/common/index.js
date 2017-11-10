// @flow
import type { Fs, Shelljs, Log, CreatePlugins } from '../external';
import type { Env } from '../annotations';

import composeShell from './shell';
import composeConfig from './config';
import composeGetPackages from './getPackages';
import composeWritePackage from './writePackage';

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
  const shell = composeShell(
    deps.external.shelljs,
    deps.external.npmlog,
  );

  const config = composeConfig({
    ...deps,
    shell,
  });

  const getPackages = composeGetPackages(
    deps.external.fs,
    deps.userConfig,
    deps.external.npmlog
  );

  const writePackage = composeWritePackage(deps.external.fs);

  return {
    shell,
    config,
    getPackages,
    writePackage,
  };
};
