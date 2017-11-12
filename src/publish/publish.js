// @flow
import type { Log } from '../external';
import type { WritePackage } from '../common/writePackage';
import type { PublishPackage } from './publishPackage';
import type { UpdateGitHead } from './updateGitHead';
import type { GetPackages } from '../common/getPackages';

export type Publish = () => Promise<void>;

export default (
  log: Log,
  getPackages: GetPackages,
  updateGitHead: UpdateGitHead,
  writePackage: WritePackage,
  publishPackage: PublishPackage,
): Publish => async() => {
  try {
    log.info('publish', 'Starting publish');

    const allPackages = getPackages();

    // eslint-disable-next-line no-plusplus
    for (let x = 0, l = allPackages.length; x < l; x++) {
      await Promise.resolve(allPackages[x])
        .then(updateGitHead)
        .then(writePackage)
        .then(publishPackage);
    }

    log.info('publish', 'Finished publish');
  } catch (e){
    log.error('publish', '%s\n%j', e.message, e);
  }
};
