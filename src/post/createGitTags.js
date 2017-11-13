// @flow
import type { GitHead, Log } from '../external';
import type { Package } from '../annotations';
import type { GetSemanticReleaseConfig } from '../common/config/config';
import type { GetGitAgent } from './getGitAgent';
import type { GetReleaseInfo } from './getReleaseInfo';
import { getPackageSlug, getReleaseTagName } from './utils';

export type CreateGitTags = (
  pkg: Package,
) => Promise<Package>;

export default (
  log: Log,
  getGitAgent: GetGitAgent,
  getReleaseInfo: GetReleaseInfo,
  getConfig: GetSemanticReleaseConfig,
  gitHead: GitHead,
): CreateGitTags => async(pkg) => {
  const config = getConfig(pkg);
  const git = getGitAgent(pkg);
  const name = getReleaseTagName(pkg);
  const {
    owner, repo,
  } = getPackageSlug(pkg);
  const ref = `refs/tags/${name}`;
  const release = getReleaseInfo(pkg);
  const sha = await gitHead();

  const tag = {
    owner,
    repo,
    ref,
    sha,
  };

  log.verbose(
    'post',
    'Creating git tag: %j',
    tag,
  );

  log.verbose(
    'post',
    'Creating release: %j',
    release,
  );

  if (config.options.debug) {
    log.info('post', 'Skipping release of package %s - debug mode', pkg.scope);
    return pkg;
  }

  await git.gitdata.createReference(tag);
  await git.repos.createRelease(release);

  return pkg;
};
