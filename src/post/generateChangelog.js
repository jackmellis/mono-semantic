// @flow
import type { Package } from '../annotations';
import type { Log } from '../external';
import type {
  GetSemanticReleaseConfig,
  SemanticReleaseConfig,
} from '../common/config';
import * as r from 'ramda';
import { promisify } from '../common/utils';

type GenerateNotes = (config: SemanticReleaseConfig) => Promise<string>;

export type GenerateChangelog = (
  pkg: Package,
) => Promise<Package>;

export default (
  log: Log,
  getConfig: GetSemanticReleaseConfig,
): GenerateChangelog => async(pkg) => {
  log.info('post', 'Generating changelog');
  const config = getConfig(pkg);

  // $FlowFixMe
  const generateNotes: GenerateNotes = promisify(config.plugins.generateNotes);

  const changelog = await generateNotes(config);

  log.verbose('post', 'Changelog: %s', changelog);

  return r.assoc('changelog', changelog, pkg);
};
