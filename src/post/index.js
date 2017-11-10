// @flow
import composeExternal from '../external';
import composeCommon from '../common';
import composeCommits from '../commits';
import composeGetGitAgent, { createGitAgent } from './getGitAgent';
import composeGetReleaseInfo from './getReleaseInfo';
import composeCreateGitTags from './createGitTags';
import composeGenerateChangelog from './generateChangelog';
import composeRestorePackage from './restorePackage';
import composePost from './post';

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

  const commits = composeCommits(deps);

  deps = {
    ...deps,
    commits,
  };

  const getGitAgent = composeGetGitAgent(
    createGitAgent,
    deps.common.config.getSemanticReleaseConfig,
  );

  const getReleaseInfo = composeGetReleaseInfo(
    deps.common.config.getSemanticReleaseConfig,
  );

  const createGitTags = composeCreateGitTags(
    deps.external.npmlog,
    getGitAgent,
    getReleaseInfo,
    deps.common.config.getSemanticReleaseConfig,
    deps.external.gitHead,
  );

  const generateChangelog = composeGenerateChangelog(
    deps.common.config.getSemanticReleaseConfig
  );

  const restorePackage = composeRestorePackage();

  const post = composePost(
    deps.external.npmlog,
    deps.common.getPackages,
    generateChangelog,
    createGitTags,
    restorePackage,
    deps.common.writePackage,
  );

  return post;
};
