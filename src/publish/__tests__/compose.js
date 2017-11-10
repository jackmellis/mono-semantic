// @flow
import { expect } from 'chai';
import compose from '../';

describe('post / publish', function() {
  it('composes publish', function() {
    const result = compose({});

    expect(result).to.be.instanceof(Function);
  });
});
