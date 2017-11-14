// @flow
import type { Log, CreatePlugins, Fs } from '../../external';
import type { Shell } from '../shell';
import { whileNil, charAt } from '../utils';
import type {
  Package,
  NpmConfig,
  Npm,
  Env,
  UserConfig,
} from '../../annotations';

import * as r from 'ramda';
import { join, resolve } from 'path';

const analyzeCommitsPath = join(__dirname, '../../plugins/analyzeCommits');
const generateNotesPath = join(__dirname, '../../plugins/generateNotes');

export type GetRootPackage = () => Package;
export const getRootPackage = (
  fs: Fs,
): GetRootPackage => () => {
  const target = join(resolve('.'), 'package.json');
  const str = fs.readFileSync(target, 'utf8');
  return JSON.parse(str);
};

export type GetUserConfig = () => UserConfig;
export const getUserConfig = (config: Object): GetUserConfig => () => {
  return r.merge({
    pathToPackages: join(resolve('.'), 'packages'),
  }, config);
};

export type GetNpmConfig = () => NpmConfig;
export const getNpmConfig = (
  shell: Shell,
): GetNpmConfig => () => {
  const configStr = shell(
    // 'npm config ls --json',
    'yarn config list --json',
    {
      silent: true,
    },
  );
  // yarn returns some awkward details
  // that we need to parse
  // $FlowFixMe
  return r.pipe(
    r.replace(/\r/g, ''),
    r.split('\n'),
    r.filter((line) => Boolean(line)),
    r.map((line): Object => JSON.parse(line)),
    r.filter((line) => line.type === 'inspect'),
    r.map(r.prop('data')),
    r.reduce(r.merge, {}),
  )(configStr);

  // return JSON.parse(configStr);
};

export type GetNpmRegistry = (pkg: Package) => string;
export const getNpmRegistry = (
  userConfig: UserConfig,
  npmConfig: NpmConfig,
  rootPackage: Package,
): GetNpmRegistry => (pkg) => {
  const registry = whileNil(
    r.always(userConfig.registry),
    r.path([ 'release', 'registry' ]),
    r.path([ 'publishConfig', 'registry' ]),
    r.ifElse(
      r.pipe(
        r.prop('name'),
        charAt(0),
        r.equals('@'),
      ),
      r.pipe(
        r.prop('name'),
        r.split('/'),
        r.head,
        r.defaultTo(''),
        (n) => `${n}:registry`,
        // eslint-disable-next-line no-underscore-dangle
        r.prop(r.__, npmConfig),
      ),
      r.always(null),
    ),
    r.always(r.path([ 'release', 'registry' ], rootPackage)),
    r.always(r.path([ 'publishConfig', 'registry' ], rootPackage)),
    r.always(r.prop('registry', npmConfig)),
    r.always('https://registry.npmjs.org'),
  )(pkg);

  return registry;
};

export type GetNpm = (pkg: Package) => Npm;
export const getNpm = (
  log: Log,
  npmConfig: NpmConfig,
  userConfig: UserConfig,
  getRegistry: GetNpmRegistry,
  rootPackage: Package,
): GetNpm => (pkg) => {
  const registry = getRegistry(pkg);
  const loglevel = whileNil(
    r.always(userConfig.loglevel),
    r.always(npmConfig.loglevel),
    r.always('warn'),
  )(null);
  const tag: string = whileNil(
    r.path([ 'release', 'tag' ]),
    r.path([ 'publishConfig', 'tag' ]),
    r.always(r.path([ 'release', 'tag' ], rootPackage)),
    r.always(r.path([ 'publishConfig', 'tag' ], rootPackage)),
    r.always(r.prop('tag', npmConfig)),
    r.always('latest'),
  )(pkg);

  const npm = {
    registry,
    loglevel,
    tag,
  };

  log.verbose('config', 'package config for %s: %j', pkg.scope, npm);

  return npm;
};

export type SemanticReleasePlugins = {
  generateNotes: (config: Object, cb: Function) => void,
};
// eslint-disable-next-line max-len
export type GetSemanticReleasePlugins = (pkg: Package) => SemanticReleasePlugins;
export const getSemanticReleasePlugins = (
  createPlugins: CreatePlugins
): GetSemanticReleasePlugins => (pkg) => {
  // $FlowFixMe
  const packagePlugins: Object = r.propOr({}, 'release', pkg);

  const plugins = {
    analyzeCommits: {
      path: analyzeCommitsPath,
      scope: pkg.scope,
    },
    generateNotes: {
      path: generateNotesPath,
      scope: pkg.scope,
    },
    ...packagePlugins,
  };

  return createPlugins(plugins);
};

export type SemanticReleaseOptions = {
  branch: string,
  fallbackTags: Object,
  debug: boolean,
};
// eslint-disable-next-line max-len
export type GetSemanticReleaseOptions = (pkg: Package) => SemanticReleaseOptions;
// eslint-disable-next-line max-len
export const getSemanticReleaseOptions = (
  env: Env,
  userConfig: UserConfig,
  rootPackage: Package,
): GetSemanticReleaseOptions => (pkg) => {
  const options = {
    branch: whileNil(
      r.always(userConfig.branch),
      r.path([ 'release', 'branch' ]),
      r.always(r.path([ 'release', 'branch' ], rootPackage)),
      r.always('master'),
    )(pkg),
    debug: whileNil(
      r.always(userConfig.debug),
      r.always(!env.CI),
    )(pkg),
    fallbackTags: { next: 'latest' },
  };

  return options;
};

export type SemanticReleaseConfig = {
  plugins: SemanticReleasePlugins,
  options: SemanticReleaseOptions,
  pkg: Package,
  npm: Npm,
  env: Env,
};
export type GetSemanticReleaseConfig = (pkg: Package) => SemanticReleaseConfig;
export const getSemanticReleaseConfig = (
  getNpm: GetNpm,
  getSemanticReleasePlugins: GetSemanticReleasePlugins,
  getSemanticReleaseOptions: GetSemanticReleaseOptions,
  env: Env,
): GetSemanticReleaseConfig => (pkg) => {
  const npm = getNpm(pkg);
  const plugins = getSemanticReleasePlugins(pkg);
  const options = getSemanticReleaseOptions(pkg);

  return {
    npm,
    plugins,
    options,
    env,
    pkg,
  };
};
