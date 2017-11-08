// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composePre from '../pre';

const rebound = () => sinon.stub().callsFake((x) => x);
const reboundP = (n = 0) => sinon.stub().callsFake(function () {
  return arguments[n];
});

describe('pre / pre', function(){
  beforeEach(function(){
    const allPackages = this.allPackages = new Array(3)
      .fill(null)
      .map(() => ({}));
    const log = this.log = {
      info: sinon.spy(),
    };
    const getPackages = this.getPackages = sinon.stub().returns(allPackages);
    const applyCurrentVersion = this.applyCurrentVersion = rebound();
    const bumpDependencies = this.bumpDependencies = reboundP(1);
    const updateVersion = this.updateVersion = reboundP();
    const writePackage = this.writePackage = sinon.spy();

    const pre = this.pre = composePre(
      log,
      getPackages,
      applyCurrentVersion,
      bumpDependencies,
      updateVersion,
      writePackage
    );
  });


  it('returns a promise', async function(){
    const { pre } = this;
    const p = pre();
    expect(p).to.be.instanceof(Promise);

    await p;
  });
  it('gets all packages', async function () {
    const { pre, getPackages } = this;
    await pre();

    expect(getPackages.called).to.be.true;
  });
  it('applies the current version to each package', async function () {
    const { pre, allPackages, applyCurrentVersion } = this;
    await pre();

    expect(applyCurrentVersion.called).to.be.true;
    expect(applyCurrentVersion.calledWith(allPackages[0])).to.be.true;
    expect(applyCurrentVersion.calledWith(allPackages[1])).to.be.true;
    expect(applyCurrentVersion.calledWith(allPackages[2])).to.be.true;
  });
  it('bumps each package\'s dependencies', async function () {
    const { pre, allPackages, bumpDependencies } = this;
    await pre();

    expect(bumpDependencies.called).to.be.true;
    expect(bumpDependencies.calledWith(allPackages, allPackages[0])).to.be.true;
    expect(bumpDependencies.calledWith(allPackages, allPackages[1])).to.be.true;
    expect(bumpDependencies.calledWith(allPackages, allPackages[2])).to.be.true;
  });
  it('updates the package\'s version', async function () {
    const { pre, allPackages, updateVersion } = this;
    await pre();

    expect(updateVersion.called).to.be.true;
    expect(updateVersion.calledWith(allPackages[0])).to.be.true;
    expect(updateVersion.calledWith(allPackages[1])).to.be.true;
    expect(updateVersion.calledWith(allPackages[2])).to.be.true;
  });
  it('writes the package', async function () {
    const { pre, allPackages, writePackage } = this;
    await pre();

    expect(writePackage.called).to.be.true;
    expect(writePackage.calledWith(allPackages[0])).to.be.true;
    expect(writePackage.calledWith(allPackages[1])).to.be.true;
    expect(writePackage.calledWith(allPackages[2])).to.be.true;
  });
});
