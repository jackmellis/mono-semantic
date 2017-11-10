// @flow
import type { Log } from '../external';
import type { GetPackages } from '../common/getPackages';
import type { WritePackage } from '../common/writePackage';
import type { GenerateChangelog } from './generateChangelog';
import type { CreateGitTags } from './createGitTags';
import type { RestorePackage } from './restorePackage';

export type Post = () => Promise<void>;

export default (
  log: Log,
  getPackages: GetPackages,
  generateChangelog: GenerateChangelog,
  createGitTags: CreateGitTags,
  restorePackage: RestorePackage,
  writePackage: WritePackage,
): Post => async() => {
  log.info('post', 'Starting post-release');

  const allPackages = getPackages();

  // eslint-disable-next-line no-plusplus
  for (let x = 0, l = allPackages.length; x < l; x++) {
    const pkg = allPackages[x];
    let promise = Promise.resolve(pkg);

    if (pkg.releaseType) {
      promise = promise
        .then(generateChangelog)
        .then(createGitTags);
    } else {
      log.info('post', 'Skipping post-release of %s - package not relased');
    }

    promise = promise
      .then((pkg) => restorePackage(allPackages, pkg))
      .then(writePackage);

    await promise;
  }

  log.info('post', 'Finished post-release');
};
