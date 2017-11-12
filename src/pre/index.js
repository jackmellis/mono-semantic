// @flow
import semRelpre from 'semantic-release/src/pre';
import composeExternal from '../external';
import composeCommon from '../common';
import composePre from './pre';
import composeApplyCurrentVersion from './applyCurrentVersion';
import composeBumpDependencies from './bumpDependencies';
import composeUpdateVersion from './updateVersion';

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
    deps.external.npmlog,
    deps.common.shell
  );

  const bumpDependencies = composeBumpDependencies(
    deps.external.npmlog
  );

  const updateVersion = composeUpdateVersion(
    deps.external.npmlog,
    semRelpre,
    deps.common.config.getSemanticReleaseConfig
  );

  const pre = composePre(
    deps.external.npmlog,
    deps.common.getPackages,
    applyCurrentVersion,
    bumpDependencies,
    updateVersion,
    deps.common.writePackage,
  );

  return pre;
};
