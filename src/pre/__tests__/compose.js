// @flow
import { expect } from 'chai';
import compose from '../';

describe('pre / compose', function() {
  this.timeout(5000);
  it('composes pre', function() {
    const result = compose({});

    expect(result).to.be.instanceof(Function);
  });
});
