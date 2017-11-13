// @flow
import type { Fs } from '../../external';
import typeof ConventionalChangelog from 'conventional-changelog';
import type { Package } from '../../annotations';
import type { TransformCommit } from './transformCommit';
import type { PackageRelease } from '../../commits/getPackageReleases';
import { join } from 'path';
import * as r from 'ramda';
import { whileNil } from '../../common/utils';

export type WriteChangelog = (
  pkg: Package,
  releases: Array<PackageRelease>,
) => Promise<void>;

export default (
  changelog: ConventionalChangelog,
  transformCommit: TransformCommit,
  fs: Fs,
  rootPackage: Package,
): WriteChangelog => (pkg, releases) => {
  // TODO: get this from userConfig
  const { scope } = pkg;
  const pathToChangelog = join(pkg.physicalLocation, 'CHANGELOG.md');
  const pathToPackage = join(pkg.physicalLocation, 'package.json');
  const writeStream = fs.createWriteStream(pathToChangelog, {
    flags: 'w',
  });

  return new Promise((resolve, reject) => {
    const stream = changelog(
      {
      // TODO: make this userConfig
        preset: 'angular',
        pkg: {
          path: pathToPackage,
        },
        // regenerate the entire changelog
        releaseCount: 0,
        transform: (commit, cb) => {
          const formatted = transformCommit(scope, commit, releases);
          cb(null, formatted);
        },
      },
      {
        repoUrl: whileNil(
          r.path([ 'repository', 'url' ]),
          r.always(r.path([ 'repository', 'url' ], rootPackage)),
        )(pkg),
      },
    ).pipe(writeStream);

    stream.on('error', reject);

    stream.on('close', () => {
      resolve();
    });
  });
};
