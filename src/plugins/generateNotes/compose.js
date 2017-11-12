// @flow
import conventionalChangelog from 'conventional-changelog';
import composeExternal from '../../external';
import composeCommon from '../../common';
import composeCommits from '../../commits';
import composeGenerateNotes from './generateNotes';
import composeTransformCommit from './transformCommit';
import composeWriteChangelog from './writeChangelog';

export default () => {
  const external = composeExternal();

  let deps = {
    userConfig: {},
    external,
  };

  const common = composeCommon(deps);
  deps.userConfig = common.config.getUserConfig();

  deps = {
    ...deps,
    common,
  };

  const commits = composeCommits(deps);

  deps = {
    ...deps,
    commits,
  };

  const transformCommit = composeTransformCommit(
    deps.commits.isValidCommit,
  );

  const writeChangelog = composeWriteChangelog(
    conventionalChangelog,
    transformCommit,
    deps.external.fs,
  );

  const generateNotes = composeGenerateNotes(
    deps.external.npmlog,
    deps.external.fs,
    deps.commits.getPackageReleases,
    writeChangelog,
  );

  return generateNotes;
};
