// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import isValidCommit from '../isValidCommit';

describe('commits / isValidCommit', function() {
  it('returns true if the commit message contains the provided scope', function(){
    const msg = 'feat(package1): did some stuff';
    const scope = 'package1';
    const result = isValidCommit(scope, msg);

    expect(result).to.be.true;
  });
  it('returns false if the commit message is for another scope', function() {
    const msg = 'feat(package2): did some other stuff';
    const scope = 'package1';
    const result = isValidCommit(scope, msg);

    expect(result).to.be.false;
  });
  it('returns false if the commit message has no scope', function() {
    const msg = 'feat: no scope here';
    const scope = 'package1';
    const result = isValidCommit(scope, msg);

    expect(result).to.be.false;
  });
  it('returns false if no message is provided', function(){
    const msg = '';
    const scope = 'package1';
    const result = isValidCommit(scope, msg);

    expect(result).to.be.false;
  });
});
