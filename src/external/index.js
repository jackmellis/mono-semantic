// @flow
import type { VersionToCommit, GitHead } from '../annotations';
import fs from 'fs';
import npmlog from 'npmlog';
import shelljs from 'shelljs';
import createPlugins from 'semantic-release/src/lib/plugins';
import versionToCommit from 'version-to-commit';
import gitHead from 'git-head';
import { promisify } from '../common/utils';

// $FlowFixMe - can't coerce Promise<any> into Promise<string>!
const versionToCommitP: VersionToCommit = promisify(versionToCommit);
// $FlowFixMe - can't coerce Promise<any> into Promise<string>!
const gitHeadp: GitHead = promisify(gitHead);

export default () => {
  return {
    fs,
    shelljs,
    npmlog,
    createPlugins,
    env: process.env,
    versionToCommit: versionToCommitP,
    gitHead: gitHeadp,
  };
};
