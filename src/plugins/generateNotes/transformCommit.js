// @flow
import typeof IsValidCommit from '../../commits/isValidCommit';
import type { PackageRelease } from '../../commits/getPackageReleases';
import * as r from 'ramda';

// $FlowFixMe - ironicaly curryN is NOT curried in the flow definition
const curry2: <A, B, C>(a: A) => (b: B) => C = r.curryN(2);

type Commit = {
  header: string,
  hash: string,
  version?: string,
}

export type TransformCommit = (
  scope: string,
  commit: Commit,
  releases: Array<PackageRelease>,
) => ?Commit;
export default (
  isValidCommit: IsValidCommit
): TransformCommit => {
  const isValidCommitc = curry2(isValidCommit);
  return (scope, commit, releases) => {

    return r.ifElse(
      r.pipe(
        r.prop('header'),
        isValidCommitc(scope),
      ),
      () => r.pipe(
        r.find(r.propEq('commit', commit.hash)),
        r.defaultTo({ version: null }),
        r.prop('version'),
        r.ifElse(
          r.isNil,
          r.always(commit),
          (version: string) => r.assoc('version', version, commit),
        ),
      )(releases),
      r.always(null),
    )(commit);
  };
};
