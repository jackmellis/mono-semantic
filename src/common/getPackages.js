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

  let resultNames: Array<string> = [];
  let left = allPackages;
  let tries = 0;

  const isPackageComplete = (pkg) => {
    // get all of the package's dependencies
    const allDependencies = r.pipe(
      r.prop('dependencies'),
      r.defaultTo({}),
      r.keys,
    )(pkg);

    // get only dependencies that are other packages in this repo
    // $FlowFixMe
    const interDependencies = r.filter(inList(packageNames), allDependencies);

    // check if all of the package's dependencies have been resolved already
    const isComplete = r.all(inList(resultNames), interDependencies);

    if (isComplete) {
      resultNames = r.append(pkg.name, resultNames);
      return false;
    }
    return true;
  };

  while (left.length && tries < 10000) {
    tries = tries + 1;
    left = r.filter(isPackageComplete, left);
  }

  if (left.length > 0) {
    const remaining = r.pipe(
      r.map(r.prop('name')),
      r.join(', '),
    )(left);
    throw new Error(`Unable to resolve packages, you may have a circular dependency. The following packages could not be resolved: ${remaining}`);
  }

  // $FlowFixMe
  const result: Array<Package> = r.map(findPackage(allPackages), resultNames);

  log.info(
    'getPackages',
    'found %i packages',
    result.length,
  );

  return result;
};
