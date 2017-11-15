// @flow
import type { Package } from '../annotations';
import type { Shell } from '../common/shell';
import { buildScriptCmd } from '../common/utils';

const scripts = [
  'publish',
  'postpublish',
];

export type RunScripts = (pkg: Package) => Package;

export default (
  shell: Shell,
): RunScripts => (pkg) => {
  if (pkg.releaseType) {
    const cmd = buildScriptCmd(pkg)(scripts);

    if (cmd) {
      shell(cmd);
    }
  }

  return pkg;
};
