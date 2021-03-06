// @flow
import composeExternal from '../external';
import composeCommon from '../common';
import composeCommits from '../commits';
import composeCreateGitTags from './createGitTags';
import composeGenerateChangelog from './generateChangelog';
import composeRestorePackage from './restorePackage';
import composeRunScripts from './runScripts';
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

  const commits = composeCommits(deps);

  deps = {
    ...deps,
    commits,
  };

  const createGitTags = composeCreateGitTags(
    deps.common.log,
    deps.common.shell,
    deps.common.config.getSemanticReleaseConfig,
    deps.external.gitHead,
  );

  const generateChangelog = composeGenerateChangelog(
    deps.common.log,
    deps.common.config.getSemanticReleaseConfig
  );

  const runScripts = composeRunScripts(
    deps.common.shell,
  );

  const restorePackage = composeRestorePackage(
    deps.common.log,
  );

  const post = composePost(
    deps.common.log,
    deps.common.getPackages,
    generateChangelog,
    createGitTags,
    runScripts,
    restorePackage,
    deps.common.writePackage,
  );

  return post;
};
