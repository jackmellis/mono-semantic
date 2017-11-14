// @flow
import type { GitHead } from '../external';
import type { Package } from '../annotations';
import * as r from 'ramda';

export type UpdateGitHead = (
  pkg: Package,
) => Promise<Package>;

export default (
  gitHead: GitHead,
): UpdateGitHead => async(pkg) => {
  if (!pkg.releaseType) {
    return pkg;
  }

  const sha = await gitHead();

  return r.assoc('gitHead', sha, pkg);
};
