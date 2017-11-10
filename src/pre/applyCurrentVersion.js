// @flow
import typeof Npmlog from 'npmlog';
import type { Shell } from '../common/shell';
import type { Package } from '../annotations';
import * as r from 'ramda';

export type ApplyCurrentVersion = (
  pkg: Package,
) => Package;
export default (
  log: Npmlog,
  shell: Shell,
): ApplyCurrentVersion => (pkg) => {
  const cmd = `npm view ${pkg.name} version`;

  log.verbose('pre', 'fetching current version of %s', pkg.scope);

  return r.tryCatch(
    r.pipe(
      () => shell(cmd, { silent: true }),
      r.trim,
      (version) => r.assoc('version', version, pkg)
    ),
    r.ifElse(
      r.pipe(
        r.pathOr('', [ 'message' ]),
        r.contains('E404'),
      ),
      r.pipe(
        r.tap(() => log.info(
          'pre',
          '%s has not yet been published',
          pkg.scope
        )),
        r.always(pkg),
      ),
      (e: Error) => {
        throw e;
      },
    ),
  )(null);
};