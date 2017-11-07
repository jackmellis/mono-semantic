// @flow
import sinon from 'sinon';
import { expect } from 'chai';
import * as utils from '../utils';

describe('whileNil', function(){
  it('returns the first matching condition', function(){
    const result = utils.whileNil(
      () => null,
      () => undefined,
      (v) => `${v}bah`,
    )('foo');

    expect(result).to.equal('foobah');
  });
  it('does not call subsequent functions', function() {
    const spy1 = sinon.stub().returns(undefined);
    const spy2 = sinon.stub().returns('foo');
    const spy3 = sinon.stub().returns('bah');

    const result = utils.whileNil(
      spy1,
      spy2,
      spy3,
    )(null);

    expect(result).to.equal('foo');
    expect(spy1.called).to.be.true;
    expect(spy2.called).to.be.true;
    expect(spy3.called).to.be.false;
  });
  it('returns null if no conditions match', function() {
    const result = utils.whileNil(
      () => {},
      () => {},
      () => {},
    )('foo');

    expect(result).to.equal(undefined);
  });
});

describe('promisify', function() {
  it('promisifies a callback-style function', function(){
    const fn = () => {};
    const fnp = utils.promisify(fn);

    expect(fnp).to.be.instanceof(Function);
    expect(fnp().then).to.be.instanceof(Function);
  });
  it('resolves with the callback value', function(done) {
    const fn = (a, b, cb) => {
      expect(a).to.equal('A');
      expect(b).to.equal('B');
      cb(null, 'success');
    };
    const fnp = utils.promisify(fn);

    fnp('A', 'B').then((result) => {
      expect(result).to.equal('success');
      done();
    });
  });
  it('rejects with the error value', function(done) {
    const err = new Error();
    const fn = (cb) => cb(err);
    const fnp = utils.promisify(fn);

    fnp().catch((e) => {
      expect(e).to.equal(err);
      done();
    });
  });
});
