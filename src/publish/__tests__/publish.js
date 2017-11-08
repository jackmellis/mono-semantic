// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import { reboundp } from '../../../test-utils';
import composePublish from '../publish';
import { assoc } from 'ramda';

describe('publish / publish', function(){
  beforeEach(function(){
    const log = this.log = {
      info: sinon.spy(),
    };
    const allPackages = this.allPackages = [
      {
        name: 'package1',
      },
      {
        name: 'package2',
      },
    ];
    const getPackages = this.getPackages = sinon.stub().returns(allPackages);
    const updateGitHead = this.updateGitHead = sinon.stub().callsFake((pkg) => {
      return assoc('gitHead', pkg.name + 'hash', pkg);
    });
    const writePackage = this.writePackage = reboundp();
    const publishPackage = this.publishPackage = reboundp();

    const publish = this.publish = composePublish(
      log,
      getPackages,
      updateGitHead,
      writePackage,
      publishPackage
    );
  });


  it('returns a promise', function(){
    const { publish } = this;
    const p = publish();

    expect(p).to.be.instanceof(Promise);
  });

  it('updates the package git head', async function(){
    const { publish, updateGitHead, allPackages } = this;

    await publish();

    expect(updateGitHead.called).to.be.true;
    allPackages.forEach((pkg) => {
      expect(updateGitHead.calledWith(pkg)).to.be.true;
    });
  });
  it('writes the package with the updated git head', async function () {
    const { publish, writePackage } = this;

    await publish();

    expect(writePackage.called).to.be.true;

    const allPackages = writePackage
    .getCalls()
      .map((call) => call.args[0]);

    expect(allPackages.length).to.equal(2);

    allPackages.forEach((pkg) => {
      expect(typeof pkg.gitHead).to.equal('string');
    });
  });
  it('publishes the package', async function () {
    const { publish, publishPackage } = this;

    await publish();

    expect(publishPackage.calledTwice).to.be.true;
  });
});
