// @flow
import type { Log, Fs } from '../../external';
import type { GetPackageReleases } from '../../commits/getPackageReleases';
import type { WriteChangelog } from './writeChangelog';
import type { Package } from '../../annotations';

import { join } from 'path';

export type GenerateNotes = (
  pluginConfig: {
    scope: string,
  },
  config: {
    pkg: Package,
  },
  done: (err: Error, result: string) => void,
) => Promise<void>;
export default (
  log: Log,
  fs: Fs,
  getPackageReleases: GetPackageReleases,
  writeChangelog: WriteChangelog,
): GenerateNotes => async(pluginConfig, config, done) => {
  const { scope } = pluginConfig;
  const { pkg } = config;

  log.info('generateNotes', 'Generating notes for %s', scope);

  const pathToChangelog = join(pkg.physicalLocation, 'CHANGELOG.md');

  const releases = await getPackageReleases(pkg);

  await writeChangelog(pkg, releases);

  // $FlowFixMe - fs has some weird ErrorNotError classes
  fs.readFile(pathToChangelog, 'utf8', done);
};
