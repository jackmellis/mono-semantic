// @flow
// a package.json file
export type Package = {
  // core properties
  name: string,
  version: string,
  // For some bizare reason flow thinks that dependencies is
  // at some point merged with publishConfig, release, and repository
  // so throws a hissy fit when you try to give dependencies
  // a more concrete definition
  dependencies: Object,
  repository: {
    url: string,
  },
  private: boolean,
  config?: {
    access?: string,
  },
  // semantic-release properties
  publishConfig?: {
    repository: string,
    tag: string,
  },
  release?: {
    branch?: string,
    githubToken?: string,
    githubUrl?: string,
    tag?: string,
    registry?: string,
    analyzeCommits: string | Object,
    generateNotes: string | Object,
  },
  // mono-semantic properties
  scope: string,
  physicalLocation: string,
  releaseType?: string,
  changelog?: string,
};

// npm's internal configuration settings
export type NpmConfig = {
  registry: string,
  loglevel?: string,
  tag?: string,
};

// npm configuration for the current package
export type Npm = {
  registry: string,
  loglevel: string,
  tag: string,
};

// environment variables
export type Env = {
  CI: ?string,
  GH_TOKEN: ?string,
  GITHUB_TOKEN: ?string,
  GH_URL: ?string,
  GITHUB_URL: ?string,
  GH_API_PATH_PREFIX: ?string,
  GITHUB_API_PATH_PREFIX: ?string,
};

// options passed into the cli
export type UserConfig = {
  pathToPackages: string,
  registry: ?string,
  loglevel: ?string,
  branch: ?string,
  debug: ?boolean,
  githubToken: ?string,
  githubUrl: ?string,
  githubApiPathPrefix: ?string,
};
