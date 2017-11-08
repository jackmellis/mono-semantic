// @flow
import type {
  GitHead,
  Package,
} from '../annotations';
import * as r from 'ramda';

export type UpdateGitHead = (
  pkg: Package,
) => Promise<Package>;

export default (
  gitHead: GitHead,
): UpdateGitHead => async(pkg) => {
  const sha = await gitHead();

  return r.assoc('gitHead', sha, pkg);
};
