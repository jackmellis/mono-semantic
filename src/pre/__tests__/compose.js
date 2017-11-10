// @flow
import { expect } from 'chai';
import compose from '../';

describe('pre / compose', function() {
  it('composes pre', function() {
    const result = compose({});

    expect(result).to.be.instanceof(Function);
  });
});
