// @flow
import type { Shell } from '../shell';
import type { Env } from '../../annotations';
import type { CreatePlugins, Log, Fs } from '../../external';
import * as _config from './config';

type Dependencies = {
  userConfig: Object,
  shell: Shell,
  external: {
    env: Env,
    createPlugins: CreatePlugins,
    npmlog: Log,
    fs: Fs,
  },
};
export default (deps: Dependencies) => {
  const getUserConfig = _config.getUserConfig(deps.userConfig);
  const getNpmConfig = _config.getNpmConfig(deps.shell);
  const getRootPackage = _config.getRootPackage(deps.external.fs);

  const userConfig = getUserConfig();
  const npmConfig = getNpmConfig();
  const rootPackage = getRootPackage();

  const getNpmRegistry = _config.getNpmRegistry(
    userConfig,
    npmConfig,
    rootPackage,
  );
  const getNpm = _config.getNpm(
    npmConfig,
    userConfig,
    getNpmRegistry,
    rootPackage,
  );
  const getSemanticReleasePlugins = _config.getSemanticReleasePlugins(
    deps.external.createPlugins
  );
  const getSemanticReleaseOptions = _config.getSemanticReleaseOptions(
    deps.external.env,
    userConfig,
    rootPackage,
  );
  const getSemanticReleaseConfig = _config.getSemanticReleaseConfig(
    getNpm,
    getSemanticReleasePlugins,
    getSemanticReleaseOptions,
    deps.external.env,
  );

  return {
    rootPackage,
    userConfig,
    npmConfig,
    getUserConfig,
    getNpmRegistry,
    getNpm,
    getSemanticReleaseConfig,
  };
};
