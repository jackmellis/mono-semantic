// @flow
// a package.json file
export type Package = {
  name: string,
  publishConfig?: {
    repository?: string,
    tag?: string,
  },
  scope: string,
  physicalLocation: string,
  release: {

  },
  dependencies: {
    [moduleName: string]: string,
  },
  repository: {
    url: string,
  },
};

// npm's internal configuration settings
export type NpmConfig = {
  registry: string,
  loglevel?: string,
  tag?: string,
};

// npm configuration for the current package
export type Npm = {};

// environment variables
export type Env = {
  CI: ?string,
  GH_TOKEN: ?string,
  GITHUB_TOKEN: ?string,
  GH_URL: ?string,
  GITHUB_URL: ?string,
};

// options passed into the cli
export type UserConfig = {
  pathToPackages: string,
};

// Promisified library methods
export type VersionToCommit = (
  name: string,
  version: string,
  registry: string,
) => Promise<string>;
