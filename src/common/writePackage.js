// @flow
import type { Fs } from '../external';
import type { Package } from '../annotations';

import { join } from 'path';
import * as r from 'ramda';
import { stringify } from '../common/utils';

export type WritePackage = (
  pkg: Package,
) => Package;
export default (
  fs: Fs,
): WritePackage => (pkg) => {
  const target = join(pkg.physicalLocation, 'package.json');

  const data = r.pipe(
    // $FlowFixMe - dissoc doesn't preserve the object's other properties
    r.dissoc('physicalLocation'),
    r.dissoc('scope'),
    stringify,
  )(pkg);

  fs.writeFileSync(target, data, 'utf8');

  return pkg;
};
