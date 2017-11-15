// @flow
import commitAnalyzer from '@semantic-release/commit-analyzer';
import composeExternal from '../../external';
import composeCommon from '../../common';
import composeCommits from '../../commits';
import composeAnalyzeCommits from './analyzeCommits';

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

  const analyzeCommits = composeAnalyzeCommits(
    deps.common.log,
    deps.commits.filterValidCommits,
    commitAnalyzer,
  );

  return analyzeCommits;
};
