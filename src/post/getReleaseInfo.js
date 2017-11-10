// @flow
import type { GetSemanticReleaseConfig } from '../common/config';
import type { Package } from '../annotations';
import { getPackageSlug, getReleaseTagName } from './utils';

export type ReleaseInfo = {
  owner: string,
  repo: string,
  tag_name: string,
  name: string,
  body: string,
  target_committish: string,
  draft: boolean,
};
export type GetReleaseInfo = (
  pkg: Package,
) => ReleaseInfo;

export default (
  getConfig: GetSemanticReleaseConfig,
): GetReleaseInfo => (pkg) => {
  const config = getConfig(pkg);

  const {
    owner,
    repo,
  } = getPackageSlug(pkg);

  const name = getReleaseTagName(pkg);

  /* eslint-disable camelcase */
  return {
    owner,
    repo,
    tag_name: name,
    name,
    body: pkg.changelog || '',
    target_committish: config.options.branch,
    draft: config.options.debug,
  };
  /* eslint-enable */
};
