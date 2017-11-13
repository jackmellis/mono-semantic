// @flow
import type { Log } from '../external';
import typeof Pre from 'semantic-release/src/pre';
import type { GetSemanticReleaseConfig } from '../common/config/config';
import type { Package } from '../annotations';
import * as r from 'ramda';

export type UpdateVersion = (
  pkg: Package
) => Promise<Package>;

export default (
  log: Log,
  pre: Pre,
  getConfig: GetSemanticReleaseConfig
): UpdateVersion => async(pkg) => {
  log.verbose('pre', 'Updating version for %s', pkg.scope);

  const options = getConfig(pkg);

  const {
    version,
    type,
  } = await pre(options)
    .catch((err: Error) => {
      if (err.code === 'ENOCHANGE') {
        log.warn('pre', 'Package %s has not changed', pkg.scope);
        return {};
      }
      throw err;
    });

  if (!version || version === pkg.version) {
    return pkg;
  }


  log.info(
    'pre',
    'Updating %s from %s to %s',
    pkg.scope,
    pkg.version,
    version,
  );

  return r.pipe(
    r.assoc('version', version),
    r.assoc('releaseType', type),
  )(pkg);
};
