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
  const cmd = buildScriptCmd(pkg)(scripts);

  shell(cmd);

  return pkg;
};
