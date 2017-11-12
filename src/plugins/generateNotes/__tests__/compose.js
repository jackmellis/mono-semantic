// @flow
import { expect } from 'chai';
import plugin from '../';

describe('plugins / generateNotes / compose', function() {
  this.timeout(5000);
  it('composes the generateNotes plugin', function() {
    expect(plugin).to.be.instanceof(Function);
  });
});
