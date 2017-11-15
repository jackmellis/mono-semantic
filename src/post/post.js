// @flow
import type { Log } from '../external';
import type { GetPackages } from '../common/getPackages';
import type { WritePackage } from '../common/writePackage';
import type { GenerateChangelog } from './generateChangelog';
import type { CreateGitTags } from './createGitTags';
import type { RestorePackage } from './restorePackage';
import type { RunScripts } from './runScripts';

export type Post = () => Promise<void>;

export default (
  log: Log,
  getPackages: GetPackages,
  generateChangelog: GenerateChangelog,
  createGitTags: CreateGitTags,
  runScripts: RunScripts,
  restorePackage: RestorePackage,
  writePackage: WritePackage,
): Post => async() => {
  try {
    log.info('post', 'Starting post-release');

    const allPackages = getPackages();

    // eslint-disable-next-line no-plusplus
    for (let x = 0, l = allPackages.length; x < l; x++) {
      const pkg = allPackages[x];
      let promise = Promise.resolve(pkg);

      if (pkg.releaseType) {
        promise = promise
          .then(generateChangelog)
          .then(createGitTags)
          .then(runScripts);
      } else {
        log.info(
          'post',
          'Skipping post-release of %s - package not relased',
          pkg.scope
        );
      }

      promise = promise
        .then((pkg) => restorePackage(allPackages, pkg))
        .then(writePackage);

      await promise;
    }

    log.info('post', 'Finished post-release');
  } catch (e){
    log.error('pre', e.message);
    log.info('pre', e);
    process.exit(1);
  }
};
