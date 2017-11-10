// @flow
import typeof Npmlog from 'npmlog';
import typeof CreatePlugins from 'semantic-release/src/lib/plugins';
import type { Shell } from './shell';
import { whileNil } from './utils';
import type {
  Package,
  NpmConfig,
  Npm,
  Env,
  UserConfig,
} from '../annotations';

import * as r from 'ramda';
import { join, resolve } from 'path';

const charAt = r.curry((i: number, str: string) => str.charAt(i));

const analyzeCommitsPath = join(__dirname, '../plugins/analyzeCommits');
const generateNotesPath = join(__dirname, '../plugins/generateNotes');

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
    'npm config ls --json',
    {
      silent: true,
    },
  );
  return JSON.parse(configStr);
};

// TODO: use userConfig as the first possible source for this
// TODO: fall back to pkg.release.registry
export type GetNpmRegistry = (pkg: Package) => string;
export const getNpmRegistry = (
  npmConfig: NpmConfig
): GetNpmRegistry => (pkg) => {
  return whileNil(
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
    r.always(r.prop('registry', npmConfig)),
    r.always('https://registry.npmjs.org'),
  )(pkg);
};

export type GetNpm = (pkg: Package) => Npm;
export const getNpm = (
  log: Npmlog,
  npmConfig: NpmConfig,
  getRegistry: GetNpmRegistry,
): GetNpm => (pkg) => {
  const registry = getRegistry(pkg);
  // TODO: use userConfig as the first source for these
  const loglevel = r.propOr('warn', 'loglevel', npmConfig);
  const tag: string = whileNil(
    // TODO: fall back to pkg.release.tag
    r.path([ 'publishConfig', 'tag' ]),
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
  githubToken: string,
  githubUrl: string,
  githubApiPathPrefix: string,
};
// eslint-disable-next-line max-len
export type GetSemanticReleaseOptions = (pkg: Package) => SemanticReleaseOptions;
// eslint-disable-next-line max-len
export const getSemanticReleaseOptions = (
  env: Env,
): GetSemanticReleaseOptions => (pkg) => {
  // TODO: use userConfig as the primary source for all of these
  // maybe use pipe + merge + pick
  // TODO: throw if githubToken or githubUrl are missing
  return {
    branch: whileNil(
      r.path([ 'release', 'branch' ]),
      r.always('master'),
    )(pkg),
    debug: whileNil(
      r.always(!env.CI),
    )(pkg),
    githubToken: whileNil(
      r.path([ 'release', 'githubToken' ]),
      r.always(env.GH_TOKEN),
      r.always(env.GITHUB_TOKEN),
      r.always(''),
    )(pkg),
    githubUrl: whileNil(
      r.path([ 'release', 'githubUrl' ]),
      r.always(env.GH_URL),
      r.always(env.GITHUB_URL),
      r.always(''),
    )(pkg),
    githubApiPathPrefix: whileNil(
      r.path([ 'release', 'githubApiPathPrefix' ]),
      r.always(env.GH_API_PATH_PREFIX),
      r.always(env.GITHUB_API_PATH_PREFIX),
      r.always(''),
    )(pkg),
    fallbackTags: { next: 'latest' },
  };
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

type Dependencies = {
  userConfig: Object,
  shell: Shell,
  external: {
    env: Env,
    createPlugins: CreatePlugins,
    npmlog: Npmlog,
  },
};
export default (deps: Dependencies) => {
  const result = {};
  result.getUserConfig = getUserConfig(deps.userConfig);
  const npmConfig = result.npmConfig = getNpmConfig(deps.shell)();
  result.getNpmRegistry = getNpmRegistry(result.npmConfig);
  result.getNpm = getNpm(
    deps.external.npmlog,
    npmConfig,
    result.getNpmRegistry
  );
  result.getSemanticReleasePlugins = getSemanticReleasePlugins(
    deps.external.createPlugins
  );
  result.getSemanticReleaseOptions = getSemanticReleaseOptions(
    deps.external.env,
  );
  result.getSemanticReleaseConfig = getSemanticReleaseConfig(
    result.getNpm,
    result.getSemanticReleasePlugins,
    result.getSemanticReleaseOptions,
    deps.external.env,
  );

  return result;
};
