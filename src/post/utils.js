// @flow
import type { Package } from '../annotations';
import parseGithubRepoUrl from 'parse-github-repo-url';
import * as r from 'ramda';

export const getPackageSlug = (
  pkg: Package,
) => {
  const slug: {
    owner: string,
    repo: string,
    version: string,
  } = r.pipe(
    (pkg) => r.path([ 'repository', 'url' ], pkg) || '',
    r.tap((url) => {
      if (!url) {
        throw new Error(`repository.url is missing from package.json of ${pkg.scope}`);
      }
    }),
    r.defaultTo(''),
    parseGithubRepoUrl,
    r.ifElse(
      r.is(Array),
      r.identity,
      r.always([]),
    ),
    r.zipObj([ 'owner', 'repo', 'version' ]),
  )(pkg);

  return slug;
};

export const getReleaseTagName = (
  pkg: Package,
) => `${pkg.scope}@${pkg.version}`;
