// @flow
import { expect } from 'chai';
import plugin from '../';

describe('plugins / analyzeCommits / compose', function () {
  this.timeout(5000);
  it('composes the analyzeCommits plugin', function () {
    expect(plugin).to.be.instanceof(Function);
  });
});
