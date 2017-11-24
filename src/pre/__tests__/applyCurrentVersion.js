// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeApplyCurrentVersion from '../applyCurrentVersion';

describe('pre / applyCurrentVersion', function(){
  beforeEach(function(){
    this.pkg = {
      scope: 'package1',
      name: '@my-scope/package1',
      version: '0.0.0',
    };
    this.log = {
      verbose: sinon.spy(),
      info: sinon.spy(),
    };
    this.shell = sinon.stub().returns('  1.2.3  ');

    this.applyCurrentVersion = composeApplyCurrentVersion(
      this.log,
      this.shell
    );
  });


  it('fetches the current published version of the package', function(){
    const { applyCurrentVersion, shell, pkg } = this;
    applyCurrentVersion(pkg);

    expect(shell.called).to.be.true;
    const cmd = shell.lastCall.args[0];

    expect(cmd).to.equal('yarn info @my-scope/package1 version --silent');
  });

  it('updates the version of the package', function(){
    const { applyCurrentVersion, pkg } = this;
    const result = applyCurrentVersion(pkg);

    expect(result.version).to.equal('1.2.3');
  });
  it('does not mutate the package', function () {
    const { applyCurrentVersion, pkg } = this;
    const result = applyCurrentVersion(pkg);

    expect(result).not.to.equal(pkg);
    expect(pkg.version).to.equal('0.0.0');
  });
  it('returns the package if it has not been published', function () {
    const { applyCurrentVersion, pkg, shell } = this;
    shell.callsFake(() => {
      throw new Error('Error: E404 - package does not exist');
    });

    expect(() => applyCurrentVersion(pkg)).not.to.throw();

    const result = applyCurrentVersion(pkg);

    expect(result.version).to.equal(pkg.version);
  });
  it('allows other errors to fall through', function () {
    const { applyCurrentVersion, pkg, shell } = this;
    shell.callsFake(() => {
      throw new Error('Error: E500 - internal error');
    });

    expect(() => applyCurrentVersion(pkg)).to.throw();
  });
});
