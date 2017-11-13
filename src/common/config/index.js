// @flow
import type { Shell } from '../shell';
import type { Env } from '../../annotations';
import type { CreatePlugins, Log } from '../../external';
import * as _config from './config';

type Dependencies = {
  userConfig: Object,
  shell: Shell,
  external: {
    env: Env,
    createPlugins: CreatePlugins,
    npmlog: Log,
  },
};
export default (deps: Dependencies) => {
  const getUserConfig = _config.getUserConfig(deps.userConfig);
  const getNpmConfig = _config.getNpmConfig(deps.shell);

  const userConfig = getUserConfig();
  const npmConfig = getNpmConfig();

  const getNpmRegistry = _config.getNpmRegistry(userConfig, npmConfig);
  const getNpm = _config.getNpm(
    deps.external.npmlog,
    npmConfig,
    userConfig,
    getNpmRegistry
  );
  const getSemanticReleasePlugins = _config.getSemanticReleasePlugins(
    deps.external.createPlugins
  );
  const getSemanticReleaseOptions = _config.getSemanticReleaseOptions(
    deps.external.env,
    userConfig
  );
  const getSemanticReleaseConfig = _config.getSemanticReleaseConfig(
    getNpm,
    getSemanticReleasePlugins,
    getSemanticReleaseOptions,
    deps.external.env,
  );

  return {
    userConfig,
    npmConfig,
    getUserConfig,
    getNpmRegistry,
    getNpm,
    getSemanticReleaseConfig,
  };
};
