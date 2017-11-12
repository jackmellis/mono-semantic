// @flow
import { expect } from 'chai';
import compose from '../';

describe('post / publish', function() {
  this.timeout(5000);
  it('composes publish', function() {
    const result = compose({});

    expect(result).to.be.instanceof(Function);
  });
});
