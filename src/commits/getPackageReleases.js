// @flow
import type { Package } from '../annotations';
import type { VersionToCommit } from '../external';
import type { Shell } from '../common/shell';
import type { GetNpmRegistry } from '../common/config/config';
import * as r from 'ramda';

export type PackageRelease = {
  commit: string,
  scope: string,
  version: string,
  tag: string,
};
export type GetPackageReleases = (
  pkg: Package,
) => Promise<Array<PackageRelease>>;
export default (
  versionToCommit: VersionToCommit,
  shell: Shell,
  getNpmRegistry: GetNpmRegistry,
): GetPackageReleases => {
  const getTags = (
    pkg: Package,
  ) => {
    const cmd = `git tag -l "${pkg.scope}@*"`;

    return r.pipe(
      shell,
      r.replace(/\r/g, ''),
      r.split('\n'),
      r.filter(r.identity),
    )(cmd);
  };

  const tagToRelease = async(
    name: string,
    registry: string,
    tag: string,
  ) => {
    const [ scope, version ] = r.split('@', tag);
    const commit = await versionToCommit(name, version, registry);

    return {
      commit,
      scope,
      version,
      tag,
    };
  };

  const tagsToReleases = (
    name: string,
    registry: string,
    tags: Array<string>,
  ) => {
    return r.map((tag) => tagToRelease(name, registry, tag), tags);
  };

  return (pkg: Package) => {
    const registry = getNpmRegistry(pkg);
    const tags = getTags(pkg);
    const promises = tagsToReleases(pkg.name, registry, tags);

    return Promise.all(promises);
  };
};
