// @flow
import type { Log } from '../external';
import type { Package } from '../annotations';
import * as r from 'ramda';
import { findPackage } from '../common/utils';

const inList = r.flip(r.contains);

export type BumpDependencies = (
  allPackages: Array<Package>,
  pkg: Package,
) => Package;
export default (
  log: Log,
): BumpDependencies => (allPackages, pkg) => {
  log.verbose('pre', 'Bumping dependencies for %s', pkg.scope);

  const packageNames = r.map(r.prop('name'), allPackages);

  // $FlowFixMe - flow doesn't know that we've filtered out nulls
  const childPackages: Array<Package> = r.pipe(
    r.prop('dependencies'),
    r.defaultTo({}),
    r.keys,
    r.filter(inList(packageNames)),
    r.map(findPackage(allPackages)),
  )(pkg);

  const childVersions: {
    [dep: string]: string
  } = r.pipe(
    // $FlowFixMe
    r.map(r.pipe(
      r.pick([ 'name', 'version' ]),
      r.values,
      r.tap(([ n: string, v: string ]) => {
        if (!v || v === '0.0.0') {
          throw new Error(`Dependency ${n} of ${pkg.scope} has not been released`);
        }
      }),
      ([ n: string, v: string ]) => ([ n, `^${v}` ]),
    )),
    r.fromPairs,
  )(childPackages);

  // $FlowFixMe - mergeDeepLeft is not covered by flow-typed lib
  const updatedPkg: Package = r.mergeDeepLeft({
    dependencies: childVersions,
  }, pkg);

  return r.ifElse(
    r.equals(pkg),
    r.always(pkg),
    r.pipe(
      r.tap(() => {
        log.info(
          'pre',
          'Updating linked dependencies of %s: %j',
          pkg.scope,
          r.keys(childVersions),
        );
      }),
      r.always(updatedPkg),
    ),
  )(updatedPkg);
};
