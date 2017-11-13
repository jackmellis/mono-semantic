// @flow
import type { Log } from '../external';
import type { Package } from '../annotations';
import type { Shell } from '../common/shell';
import type { GetSemanticReleaseConfig } from '../common/config/config';
import * as r from 'ramda';

export type PublishPackage = (
  pkg: Package,
) => Package;

export default (
  log: Log,
  shell: Shell,
  getConfig: GetSemanticReleaseConfig,
): PublishPackage => (pkg) => {
  if (pkg.private) {
    log.warn(
      'publish',
      'Skipping publish for %s - package is private',
      pkg.scope
    );
    return pkg;
  }

  if (!pkg.releaseType) {
    log.info('publish', 'Skipping publish for %s - no new release', pkg.scope);
    return pkg;
  }

  const options = getConfig(pkg);

  // $FlowFixMe - r.startsWith is not covered in libdef
  const startsWithAt: (str: string) => boolean = r.startsWith('@');

  const access = r.ifElse(
    r.both(
      r.pipe(
        r.prop('name'),
        startsWithAt,
      ),
      r.pathEq([ 'config', 'access' ], 'public'),
    ),
    r.always('--access=public'),
    r.always(''),
  )(pkg);


  const target = pkg.physicalLocation;

  const tag = options.npm.tag;

  const cmd = `npm publish ${access} --tag ${tag} ${target}`;

  if (options.options.debug) {
    log.verbose('publish', cmd);
    log.warn('publish', 'Skipping publish %s - debug mode', pkg.scope);
    return pkg;
  }

  log.info('publish', 'Publishing %s', pkg.name);
  shell(cmd);

  return pkg;
};
