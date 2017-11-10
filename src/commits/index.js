// @flow
import type { VersionToCommit } from '../external';
import type { Shell } from '../common/shell';
import type { GetNpmRegistry } from '../common/config';

import isValidCommit from './isValidCommit';
import filterValidCommits from './filterValidCommits';
import composeGetPackageReleases from './getPackageReleases';

type Dependencies = {
  common: {
    shell: Shell,
    config: {
      getNpmRegistry: GetNpmRegistry,
    },
  },
  external: {
    versionToCommit: VersionToCommit,
  },
};
export default (deps: Dependencies) => {
  const getPackageReleases = composeGetPackageReleases(
    deps.external.versionToCommit,
    deps.common.shell,
    deps.common.config.getNpmRegistry
  );

  return {
    filterValidCommits,
    isValidCommit,
    getPackageReleases,
  };
};
