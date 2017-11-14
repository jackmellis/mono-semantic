// @flow
import type { Log, Fs } from '../external';
import type { Package, UserConfig } from '../annotations';

import * as r from 'ramda';
import { join } from 'path';
import { parse, findPackage, charAt } from '../common/utils';

const inList = r.flip(r.contains);

export type GetPackages = () => Array<Package>;
export default (
  fs: Fs,
  userConfig: UserConfig,
  log: Log,
  rootPackage: Package,
): GetPackages => () => {
  log.verbose(
    'getPackages',
    'looking for packages in %s',
    userConfig.pathToPackages,
  );
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

  // Validate packages
  log.verbose('getPackages', 'Validating packages');
  r.forEach((pkg) => {
    if (!pkg.name) {
      throw new Error(`Package name missing from ${pkg.scope}`);
    }
    if (r.both(
      r.pipe(
        r.always(r.path([ 'repository', 'url' ], pkg)),
        r.isNil,
      ),
      r.pipe(
        r.always(r.path([ 'repository', 'url' ], rootPackage)),
        r.isNil,
      ),
    )(null)) {
      throw new Error(`repository.url is missing from ${pkg.scope}`);
    }

    r.when(
      r.both(
        r.pipe(
          r.prop('name'),
          charAt(0),
          r.equals('@'),
        ),
        r.pipe(
          r.path([ 'publishConfig', 'access' ]),
          r.complement(r.equals('public')),
        ),
      ),
      () => {
        log.warn(
          'getPackages',
          '%s is a scoped package but does not have public access',
          pkg.scope,
        );
      }
    )(pkg);
  }, allPackages);

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

  log.info(
    'getPackages',
    'found %i packages',
    result.length,
  );

  return result;
};
