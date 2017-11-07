// @flow
import * as r from 'ramda';
import isValidCommit from './isValidCommit';

type Commit = {
  message: string,
};
type Config = {
  commits: Array<Commit>,
};

export default (
  scope: string,
  config: Config,
): Config => {
  const { commits: allCommits } = config;
  const commits = r.filter(r.pipe(
    r.prop('message'),
    r.curry(isValidCommit)(scope),
  ), allCommits);

  return r.assoc('commits', commits, config);
};
