// @flow
import Github from 'github';
import type { Package } from '../annotations';
import type { GetSemanticReleaseConfig } from '../common/config/config';
import * as r from 'ramda';
import url from 'url';

const parse: (url: string) => {
  port: string,
  protocol: string,
  hostname: string,
} = r.pipe(
  r.unary(url.parse),
  r.defaultTo({
    port: '',
    protocol: '',
    hostname: '',
  }),
);

export const createGitAgent = (
  options: {
    port: ?string,
    host: ?string,
    protocol: ?string,
    pathPrefix: ?string,
  },
): typeof Github => {
  // $FlowFixMe - flow seems incapable of importing class constructors
  return new Github(options);
};

export type GetGitAgent = (
  pkg: Package
) => typeof Github;

export default (
  createGitAgent: typeof createGitAgent,
  getConfig: GetSemanticReleaseConfig,
): GetGitAgent => (pkg) => {
  const config = getConfig(pkg);

  const url = r.defaultTo('', config.options.githubUrl);

  const urlParts = parse(url);

  const {
    port,
    hostname: host,
  } = urlParts;
  const protocol = r.pipe(
    r.defaultTo(''),
    r.split(':'),
    r.head,
    r.defaultTo(null),
  )(urlParts.protocol);

  const pathPrefix = r.defaultTo(
    null,
    config.options.githubApiPathPrefix
  );

  const agent = createGitAgent({
    port,
    host,
    protocol,
    pathPrefix,
  });

  agent.authenticate({
    type: 'token',
    token: config.options.githubToken,
  });

  return agent;
};
