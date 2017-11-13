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

  if (deps.userConfig.loglevel) {
    deps.external.npmlog.level = userConfig.loglevel;
    // $FlowFixMe
  } else if (deps.common.config.npmConfig.loglevel) {
    deps.external.npmlog.level = deps.common.config.npmConfig.loglevel;
  }

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
    deps.external.npmlog,
    deps.common.config.getSemanticReleaseConfig
  );

  const restorePackage = composeRestorePackage(
    deps.external.npmlog,
  );

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
