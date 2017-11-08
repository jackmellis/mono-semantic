// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeUpdateVersion from '../updateVersion';

describe('pre / updateVersion', function(){
  beforeEach(function(){
    this.log = {
      verbose: sinon.spy(),
      info: sinon.spy(),
      warn: sinon.spy(),
    };
    this.getConfig = sinon.stub().returns({});
    this.pre = sinon.stub().resolves({
      version: '1.0.1',
      type: 'patch',
    });
    this.updateVersion = composeUpdateVersion(
      this.log,
      this.pre,
      this.getConfig,
    );
    this.pkg = {
      scope: 'package1',
      version: '1.0.0',
    };
  });

  it('calls semantic-release pre', function(){
    const { pre, updateVersion, pkg } = this;

    updateVersion(pkg);

    expect(pre.called).to.be.true;
  });
  it('updates the package version', async function () {
    const { updateVersion, pkg } = this;

    const result = await updateVersion(pkg);

    expect(result).not.to.deep.equal(pkg);
    expect(result.version).to.equal('1.0.1');
  });
  it('updates the package release type', async function () {
    const { updateVersion, pkg } = this;

    const result = await updateVersion(pkg);

    expect(result).not.to.deep.equal(pkg);
    expect(result.releaseType).to.equal('patch');
  });
  it('skips the package if no changes have been made', async function () {
    const { updateVersion, pre, pkg } = this;

    pre.rejects({ code: 'ENOCHANGE' });

    const result = await updateVersion(pkg);

    expect(result).to.deep.equal(pkg);
    expect(result.version).to.equal('1.0.0');
  });
});
