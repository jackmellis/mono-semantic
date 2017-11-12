// @flow
import type { Package } from '../annotations';
import type { Log } from '../external';
import * as r from 'ramda';
import { findPackage } from '../common/utils';

const inList = r.flip(r.contains);

export type RestorePackage = (
  allPackages: Array<Package>,
  pkg: Package,
) => Package;

export default (
  log: Log,
): RestorePackage => (allPackages, pkg) => {
  if (!pkg.releaseType) {
    return pkg;
  }

  log.info('post', 'Restoring package %s', pkg.scope);
  log.verbose('post', 'Removing releaseType');
  log.verbose('post', 'Removing gitHead');
  log.verbose('post', 'Removing changelog');

  const names = r.map(r.prop('name'), allPackages);

  const deps = r.pipe(
    r.prop('dependencies'),
    r.defaultTo({}),
    r.keys,
    r.filter(inList(names)),
    r.map(findPackage(allPackages)),
  )(pkg);

  const links: {
    [dep: string]: string
  } = r.pipe(
    // $FlowFixMe
    r.map(r.pipe(
      r.pick([ 'name', 'scope' ]),
      r.values,
      ([ n, v ]) => [ n, `link:../${v}` ],
    )),
    r.fromPairs,
  )(deps);

  if (deps.length) {
    log.verbose(
      'post',
      'Restoring dependencies: %j',
      r.map(r.prop('name'), deps),
    );
  }

  // $FlowFixMe
  const restored: Package = r.pipe(
    // $FlowFixMe
    r.dissoc('releaseType'),
    r.dissoc('gitHead'),
    r.dissoc('changelog'),
    r.assoc('dependencies', r.merge(pkg.dependencies, links)),
  )(pkg);

  return restored;
};
