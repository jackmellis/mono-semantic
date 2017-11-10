// @flow
import type { Log } from '../../external';
import typeof FilterValidCommits from '../../commits/filterValidCommits';
import typeof CommitAnalyzer from '@semantic-release/commit-analyzer';

export type AnalyzeCommits = (
  pluginConfig: {
    scope: string,
  },
  config: {
    commits: Array<{ message: string }>,
  },
  done: Function,
) => void;
export default (
  log: Log,
  filterValidCommits: FilterValidCommits,
  analyzer: CommitAnalyzer,
): AnalyzeCommits => (pluginConfig = {}, config, done) => {
  const { scope } = pluginConfig;
  log.verbose('analyzeCommits', 'Analyze commits');

  const newConfig = filterValidCommits(scope, config);

  log.info(
    'analyzeCommits',
    'Found %s commits for scope %s',
    newConfig.commits.length,
    scope
  );

  analyzer(pluginConfig, config, done);
};
