// @flow
import typeof Npmlog from 'npmlog';
import typeof Fs from 'fs';
import type { Package, UserConfig } from '../annotations';

import * as r from 'ramda';
import { join } from 'path';
import { parse, findPackage } from '../common/utils';

const inList = r.flip(r.contains);

export type GetPackages = () => Array<Package>;
export default (
  fs: Fs,
  userConfig: UserConfig,
  log: Npmlog,
): GetPackages => () => {
  const packageScopes = fs.readdirSync(userConfig.pathToPackages);

  const allPackages: Array<Package> = r.map((scope) => {
    const pathToPackage = join(userConfig.pathToPackages, scope);
    const pathToPackageJson = join(pathToPackage, 'package.json');

    const pkgContent = fs.readFileSync(pathToPackageJson, 'utf8');
    const pkg: Package = parse(pkgContent);

    return r.pipe(
      r.assoc('physicalLocation', pathToPackage),
      r.assoc('scope', scope),
      // $FlowFixMe - not covered by flow-typed libdef
      r.mergeDeepLeft({
        dependencies: {},
      }),
    )(pkg);
  }, packageScopes);

  const packageNames = r.map(r.prop('name'), allPackages);

  // Test if a package is used by any other packages
  const isADependency = (pkg) => r.pipe(
    r.map(r.prop('dependencies')),
    r.map(r.keys),
    r.flatten,
    r.contains(pkg.name),
  )(allPackages);
  const isNotADependency = r.complement(isADependency);

  // Find only packages that are not dependend on first
  const root = r.filter(isNotADependency, allPackages);

  const foldPackage = (pkg: Package) => {
    // $FlowFixMe - flow does not understand that all nulls have been filtered
    const deps: Array<Package> = r.pipe(
      r.prop('dependencies'),
      r.keys,
      r.filter(inList(packageNames)),
      r.map(findPackage(allPackages)),
      r.filter((pkg) => pkg != null),
    )(pkg);

    // eslint-disable-next-line no-use-before-define
    return foldPackages(deps);
  };

  const foldPackages = (packages: Array<Package>) => {
    const deps = r.reduce(
      (arr, pkg) => arr.concat(foldPackage(pkg)),
      [],
      packages
    );

    return r.concat(packages, deps);
  };

  const result = r.pipe(
    foldPackages,
    r.reverse,
    r.uniqBy(r.prop('name')),
  )(root);

  log.verbose(
    'getPackages',
    'found %i packages',
    result.length,
  );

  return result;
};
