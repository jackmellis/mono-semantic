// @flow
import composeExternal from '../external';
import composeCommon from '../common';
import composeUpdateGitHead from './updateGitHead';
import composePublishPackage from './publishPackage';
import composePublish from './publish';

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

  const updateGitHead = composeUpdateGitHead(
    deps.external.gitHead,
  );

  const publishPackage = composePublishPackage(
    deps.common.log,
    deps.common.shell,
    deps.common.config.getSemanticReleaseConfig,
    deps.external.process,
  );

  const publish = composePublish(
    deps.common.log,
    deps.common.getPackages,
    updateGitHead,
    deps.common.writePackage,
    publishPackage
  );

  return publish;
};
