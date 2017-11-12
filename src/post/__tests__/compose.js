// @flow
import { expect } from 'chai';
import compose from '../';

describe('post / compose', function() {
  this.timeout(5000);
  it('composes post', function() {
    const result = compose({});

    expect(result).to.be.instanceof(Function);
  });
});
