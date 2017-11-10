// @flow
import type { GitHead, Log } from '../external';
import type { Package } from '../annotations';
import type { GetSemanticReleaseConfig } from '../common/config';
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

  if (config.options.debug) {
    log.info('post', `Creating draft release ${name}`);
  } else {
    await git.gitdata.createReference(tag);
    log.info('post', `Creating release ${name}`);
  }
  await git.repos.createRelease(release);

  return pkg;
};
