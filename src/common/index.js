// @flow
import typeof Fs from 'fs';
import typeof Shelljs from 'shelljs';
import typeof Npmlog from 'npmlog';
import typeof CreatePlugins from 'semantic-release/src/lib/plugins';
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
    npmlog: Npmlog,
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

  const getPackages = composeGetPackages(deps.external.fs, deps.userConfig);

  const writePackage = composeWritePackage(deps.external.fs);

  return {
    shell,
    config,
    getPackages,
    writePackage,
  };
};
