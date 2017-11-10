// @flow
import composeExternal from '../external';
import composeCommon from '../common';
import composeUpdateGitHead from './updateGitHead';
import composePublishPackage from './publishPackage';
import composePublish from './publish';

export default (userConfig: Object) => {
  const external = composeExternal();

  let deps = {
    userConfig,
    external,
  };

  const common = composeCommon(deps);

  if (common.config.npmConfig.loglevel) {
    deps.external.npmlog.level = common.config.npmConfig.loglevel;
  }

  deps = {
    ...deps,
    userConfig: common.config.getUserConfig(),
    common,
  };

  const updateGitHead = composeUpdateGitHead(
    deps.external.gitHead,
  );

  const publishPackage = composePublishPackage(
    deps.external.npmlog,
    deps.common.shell,
    deps.common.config.getSemanticReleaseConfig
  );

  const publish = composePublish(
    deps.external.npmlog,
    deps.common.getPackages,
    updateGitHead,
    deps.common.writePackage,
    publishPackage
  );

  return publish;
};
