// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeWritePackage from '../writePackage';

describe('common / writePackage', function() {
  beforeEach(function(){
    const fs = this.fs = {
      writeFileSync: sinon.spy(),
    };
    this.pkg = {
      physicalLocation: '/path/to/package',
      scope: 'my-scope',
      dependencies: {},
    };
    this.writePackage = composeWritePackage(fs);
  });

  it('saves the package', function(){
    const {
      writePackage, fs, pkg,
    } = this;

    writePackage(pkg);

    expect(fs.writeFileSync.called).to.be.true;
    expect(fs.writeFileSync.calledWith('/path/to/package/package.json', sinon.match.string, 'utf8')).to.be.true;
  });
  it('removes the location and scope before saving', function() {
    const {
      writePackage, fs, pkg,
    } = this;

    writePackage(pkg);

    const data = JSON.stringify({ dependencies: {} }, null, 2);

    expect(fs.writeFileSync.called).to.be.true;
    expect(fs.writeFileSync.calledWith(
      sinon.match.string,
      data,
      sinon.match.string,
    )).to.be.true;
  });
});
