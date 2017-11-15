// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composePublishPackage from '../publishPackage';

describe('publish / publishPackage', function(){
  beforeEach(function(){
    const pkg = this.pkg = {
      version: '1.2.3',
      private: false,
      releaseType: 'minor',
      name: 'package1',
      physicalLocation: '/path/to/package',
    };
    const config = this.config = {
      npm: {
        tag: 'latest',
      },
      options: {
        debug: false,
      },
    };
    const log = this.log = {
      verbose: sinon.spy(),
      info: sinon.spy(),
      warn: sinon.spy(),
    };
    const shell = this.shell = sinon.spy();
    const getConfig = this.getConfig = sinon.stub().returns(config);
    const process = this.process = {
      cwd: sinon.stub().returns('current_dir'),
      chdir: sinon.spy(),
    };

    this.publishPackage = composePublishPackage(
      log,
      shell,
      getConfig,
      process,
    );
  });


  it('returns a package', function(){
    const { pkg, publishPackage } = this;
    const result = publishPackage(pkg);

    expect(result).to.be.instanceof(Object);
    expect(result).to.deep.equal(pkg);
  });
  it('runs a publish command', function () {
    const { pkg, publishPackage, shell } = this;
    const expected = 'yarn publish --new-version 1.2.3 --tag latest --ignore-scripts';

    publishPackage(pkg);

    expect(shell.called).to.be.true;
    const actual = shell.lastCall.args[0];
    expect(actual).to.equal(expected);
  });
  context('when package is scoped', function () {
    it('adds a public access flag', function () {
      const { pkg, publishPackage, shell } = this;
      const expected = 'yarn publish --new-version 1.2.3 --access public --tag latest --ignore-scripts';
      pkg.name = '@scope/package1';
      pkg.publishConfig = {
        access: 'public',
      };

      publishPackage(pkg);

      expect(shell.called).to.be.true;
      const actual = shell.lastCall.args[0];
      expect(actual).to.equal(expected);
    });
    it('does not add an access flag if package is private', function () {
      const { pkg, publishPackage, shell } = this;
      const expected = 'yarn publish --new-version 1.2.3 --tag latest --ignore-scripts';
      pkg.name = '@scope/package1';
      pkg.config = null;

      publishPackage(pkg);

      expect(shell.called).to.be.true;
      const actual = shell.lastCall.args[0];
      expect(actual).to.equal(expected);
    });
  });
  it('adds the config tag to the command', function () {
    const { pkg, publishPackage, config, shell } = this;
    const expected = 'yarn publish --new-version 1.2.3 --tag next --ignore-scripts';
    config.npm.tag = 'next';

    publishPackage(pkg);

    expect(shell.called).to.be.true;
    const actual = shell.lastCall.args[0];
    expect(actual).to.equal(expected);
  });
  it('does not run the publish command if in debug mode', function () {
    const { pkg, publishPackage, config, shell } = this;
    config.options.debug = true;

    publishPackage(pkg);

    expect(shell.called).to.be.false;
  });
  it('does not run the publish command if private', function () {
    const { pkg, publishPackage, shell } = this;
    pkg.private = true;

    publishPackage(pkg);

    expect(shell.called).to.be.false;
  });
  it('does not run the publish command if package has not changed', function () {
    const { pkg, publishPackage, shell } = this;
    pkg.releaseType = null;

    publishPackage(pkg);

    expect(shell.called).to.be.false;
  });
});
