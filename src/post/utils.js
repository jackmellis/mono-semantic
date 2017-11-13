// @flow
import type { Package } from '../annotations';

// eslint-disable-next-line import/prefer-default-export
export const getReleaseTagName = (
  pkg: Package,
) => `${pkg.scope}@${pkg.version}`;
