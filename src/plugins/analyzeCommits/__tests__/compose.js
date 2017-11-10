// @flow
import { expect } from 'chai';
import plugin from '../';

describe('plugins / analyzeCommits / compose', function () {
  it('composes the analyzeCommits plugin', function () {
    expect(plugin).to.be.instanceof(Function);
  });
});
