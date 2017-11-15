// @flow
import semRelpre from 'semantic-release/src/pre';
import composeExternal from '../external';
import composeCommon from '../common';
import composePre from './pre';
import composeApplyCurrentVersion from './applyCurrentVersion';
import composeBumpDependencies from './bumpDependencies';
import composeUpdateVersion from './updateVersion';
import composeRunScripts from './runScripts';

// eslint-disable-next-line import/no-commonjs
module.exports = (userConfig: Object) => {
  const external = composeExternal();

  let deps = {
    userConfig,
    external,
  };

  const common = composeCommon(deps);

  deps = {
    ...deps,
    userConfig: common.config.getUserConfig(),
    common,
  };

  const applyCurrentVersion = composeApplyCurrentVersion(
    deps.common.log,
    deps.common.shell
  );

  const bumpDependencies = composeBumpDependencies(
    deps.common.log
  );

  const updateVersion = composeUpdateVersion(
    deps.common.log,
    semRelpre,
    deps.common.config.getSemanticReleaseConfig
  );

  const runScripts = composeRunScripts(
    deps.common.shell
  );

  const pre = composePre(
    deps.common.log,
    deps.common.getPackages,
    applyCurrentVersion,
    bumpDependencies,
    updateVersion,
    deps.common.writePackage,
    runScripts,
  );

  return pre;
};
