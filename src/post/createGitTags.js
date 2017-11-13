// @flow
import type { GitHead, Log } from '../external';
import type { Package } from '../annotations';
import type { GetSemanticReleaseConfig } from '../common/config/config';
import type { Shell } from '../common/shell';
import { getReleaseTagName } from './utils';

export type CreateGitTags = (
  pkg: Package,
) => Promise<Package>;

export default (
  log: Log,
  shell: Shell,
  getConfig: GetSemanticReleaseConfig,
  gitHead: GitHead,
): CreateGitTags => async(pkg) => {
  const config = getConfig(pkg);
  const name = getReleaseTagName(pkg);
  const sha = await gitHead();

  log.verbose(
    'post',
    'Creating git tag: %s (%s)',
    name,
    sha,
  );

  if (config.options.debug) {
    log.info('post', 'Skipping release of package %s - debug mode', pkg.scope);
    return pkg;
  }

  const cmd = `git tag -a ${name} ${sha} -m "${name}"`;
  shell(cmd);

  return pkg;
};
