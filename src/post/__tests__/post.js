// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import { rebound, reboundp } from '../../../test-utils';
import composePost from '../post';

describe('post / post', function(){
  beforeEach(function(){
    const log = {
      info: sinon.spy(),
    };
    const packages = this.packages = [
      {
        releaseType: 'initial',
      },
      {
        releaseType: 'patch',
      }
    ];
    const getPackages = this.getPackages = sinon.stub().returns(packages);
    const generateChangelog = this.generateChangelog = reboundp();
    const createGitTags = this.createGitTags = reboundp();
    const restorePackage = this.restorePackage = rebound(1);
    const writePackage = this.writePackage = rebound();
    const runScripts = this.runScripts = rebound();

    this.post = composePost(
      log,
      getPackages,
      generateChangelog,
      createGitTags,
      runScripts,
      restorePackage,
      writePackage
    );
  });

  it('generates a changelog', async function () {
    const { post, packages, generateChangelog } = this;
    await post();

    expect(generateChangelog.called).to.be.true;
    packages.forEach((pkg) => {
      expect(generateChangelog.calledWith(pkg));
    });
  });
  it('creates a release / tag on git', async function () {
    const { post, packages, createGitTags } = this;
    await post();

    expect(createGitTags.called).to.be.true;
    packages.forEach((pkg) => {
      expect(createGitTags.calledWith(pkg));
    });
  });
  it('restores the package.json', async function () {
    const { post, packages, restorePackage } = this;
    await post();

    expect(restorePackage.called).to.be.true;
    packages.forEach((pkg) => {
      expect(restorePackage.calledWith(packages, pkg));
    });
  });
  it('writes the package', async function () {
    const { post, packages, writePackage } = this;
    await post();

    expect(writePackage.called).to.be.true;
    packages.forEach((pkg) => {
      expect(writePackage.calledWith(pkg));
    });
  });
  it('skips packages that haven\'t changed', async function () {
    const {
      post,
      packages,
      restorePackage,
      writePackage,
      generateChangelog,
      createGitTags,
      runScripts,
    } = this;

    packages.forEach((pkg) => pkg.releaseType = null);

    await post();

    expect(generateChangelog.called).to.be.false;
    expect(createGitTags.called).to.be.false;
    expect(runScripts.called).to.be.false;
    expect(restorePackage.called).to.be.true;
    expect(writePackage.called).to.be.true;
  });
});
