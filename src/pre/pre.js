// @flow
import type { Log } from '../external';
import type { GetPackages } from '../common/getPackages';
import type { WritePackage } from '../common/writePackage';
import type { ApplyCurrentVersion } from './applyCurrentVersion';
import type { BumpDependencies } from './bumpDependencies';
import type { UpdateVersion } from './updateVersion';
import * as r from 'ramda';

export type Pre = () => Promise<void>;

export default (
  log: Log,
  getPackages: GetPackages,
  applyCurrentVersion: ApplyCurrentVersion,
  bumpDependencies: BumpDependencies,
  updateVersion: UpdateVersion,
  writePackage: WritePackage,
): Pre => async() => {
  try {
    log.info('pre', 'Starting pre-release');

    const allPackages = r.pipe(
      getPackages,
      r.map(applyCurrentVersion),
    )(null);

    // eslint-disable-next-line no-plusplus
    for (let x = 0, l = allPackages.length; x < l; x++) {
      allPackages[x] = await Promise
        .resolve(allPackages[x])
        .then((pkg) => bumpDependencies(allPackages, pkg))
        .then(updateVersion)
        .then(writePackage);
    }

    log.info('pre', 'Finished pre-release');
  } catch (e){
    log.error('pre', e.message);
    log.info('pre', e);
    process.exit(1);
  }
};
