// @flow
import type { Package } from '../annotations';
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
  getConfig: GetSemanticReleaseConfig,
): GenerateChangelog => async(pkg) => {
  const config = getConfig(pkg);

  // $FlowFixMe
  const generateNotes: GenerateNotes = promisify(config.plugins.generateNotes);

  const changelog = await generateNotes(config);

  return r.assoc('changelog', changelog, pkg);
};
