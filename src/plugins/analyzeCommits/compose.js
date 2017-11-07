// @flow
import npmlog from 'npmlog';
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
  if (common.config.npmConfig.loglevel) {
    deps.external.npmlog.level = common.config.npmConfig.loglevel;
  }

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
    npmlog,
    deps.commits.filterValidCommits,
    commitAnalyzer,
  );

  return analyzeCommits;
};
