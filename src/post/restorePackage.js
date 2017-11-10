// @flow
import type { Package } from '../annotations';
import * as r from 'ramda';
import { findPackage } from '../common/utils';

const inList = r.flip(r.contains);

export type RestorePackage = (
  allPackages: Array<Package>,
  pkg: Package,
) => Package;

export default (): RestorePackage => (allPackages, pkg) => {
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
