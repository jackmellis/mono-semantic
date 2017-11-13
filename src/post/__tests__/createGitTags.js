// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeCreateGitTags from '../createGitTags';

describe('post / createGitTags', function(){
  beforeEach(function(){
    const pkg = this.pkg = {
      name: '@my-scope/my-package',
      scope: 'my-package',
      version: '1.2.3',
      repository: {
        url: 'https://github.com/owner/repo',
      }
    };
    const log = this.log = {
      info: sinon.spy(),
      verbose: sinon.spy(),
    };
    const shell = this.shell = sinon.stub();
    const config = this.config = {
      options: {
        debug: false,
      },
    };
    const getConfig = this.getConfig = sinon.stub().returns(config);
    const gitHead = sinon.stub().resolves('my-sha');

    this.createGitTags = composeCreateGitTags(
      log,
      shell,
      getConfig,
      gitHead
    );
  });

  it('resolves the package', async function () {
    const { pkg, createGitTags } = this;
    const result = await createGitTags(pkg);
    expect(result).to.deep.equal(pkg);
  });
  context('when in debug/draft mode', function () {
    it('does not create a reference', async function () {
      const { pkg, createGitTags, config, shell } = this;
      config.options.debug = true;
      const result = await createGitTags(pkg);

      expect(shell.called).to.be.false;
    });
  });
  context('when in release mode', function () {
    it('creates a reference', async function () {
      const { pkg, createGitTags, config, shell } = this;
      const result = await createGitTags(pkg);

      expect(shell.called).to.be.true;
      console.log(shell.lastCall.args[0])
      expect(shell.calledWith('git tag -a my-package@1.2.3 my-sha -m "my-package@1.2.3"')).to.be.true;
    });
  });
});
