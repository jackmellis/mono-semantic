#! /usr/bin/env node
/* eslint-disable import/no-commonjs */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-undefined */

const yargs = require('yargs');

const keys = [
  'debug',
  'pathToPackages',
  'registry',
  'loglevel',
  'branch',
  'githubToken',
  'githubUrl',
  'githubApiPathPrefix',
];

yargs
  .boolean('debug')
  .default('debug', undefined)
  .string('pathToPackages')
  .alias('path-to-packages', 'pathToPackages')
  .string('registry')
  .string('loglevel')
  .string('branch')
  .string('githubToken')
  .alias('github-token', 'githubToken')
  .string('githubUrl')
  .alias('github-url', 'githubUrl')
  .string('githubApiPathPrefix')
  .alias('github-api-path-prefix', 'githubApiPathPrefix');

const options = {};
keys.forEach((key) => {
  const value = yargs.argv[key];
  if (value !== undefined) {
    options[key] = value;
  }
});

const mode = yargs.argv._[0];

switch (mode) {
case 'pre':
case 'publish':
case 'post':
  break;
default:
  throw new Error(`Unknown process: ${mode}`);
}

const process = require(`../dist/${mode}`)(options);

process(options);
