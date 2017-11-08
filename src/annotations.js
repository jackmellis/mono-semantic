// @flow
// a package.json file
export type Package = {
  name: string,
  version: string,
  publishConfig?: {
    repository: string,
    tag: string,
  },
  release?: {
    branch?: string,
    githubToken?: string,
    githubUrl?: string,
    analyzeCommits: string | Object,
    generateNotes: string | Object,
  },
  scope: string,
  physicalLocation: string,
  // For some bizare reason flow thinks that dependencies is
  // at some point merged with publishConfig, release, and repository
  // so throws a hissy fit when you try to give dependencies
  // a more concrete definition
  dependencies: Object,
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
