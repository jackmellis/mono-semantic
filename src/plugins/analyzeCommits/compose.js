// @flow
import { type VersionToCommit } from '../../annotations';
import fs from 'fs';
import npmlog from 'npmlog';
import shelljs from 'shelljs';
import createPlugins from 'semantic-release/src/lib/plugins';
import commitAnalyzer from '@semantic-release/commit-analyzer';
import versionToCommit from 'version-to-commit';
import { promisify } from '../../common/utils';
import composeCommon from '../../common';
import composeCommits from '../../commits';
import composeAnalyzeCommits from './analyzeCommits';

// $FlowFixMe - can't coerce Promise<any> into Promise<string>!
const versionToCommitP: VersionToCommit = promisify(versionToCommit);

export default () => {
  let deps = {
    userConfig: {},
    external: {
      fs,
      shelljs,
      npmlog,
      createPlugins,
      env: process.env,
      versionToCommit: versionToCommitP,
    },
  };

  const common = composeCommon(deps);
  deps.userConfig = common.config.getUserConfig();
  if (common.config.npmConfig.loglevel) {
    npmlog.level = common.config.npmConfig.loglevel;
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
