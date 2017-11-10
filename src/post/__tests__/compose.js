// @flow
import { expect } from 'chai';
import compose from '../';

describe('post / compose', function() {
  it('composes post', function() {
    const result = compose({});

    expect(result).to.be.instanceof(Function);
  });
});
