// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeCreateGitTags from '../createGitTags';

describe('post / createGitTags', function(){
  beforeEach(function(){
    const pkg = this.pkg = {
      repository: {
        url: 'https://github.com/owner/repo',
      }
    };
    const log = this.log = {
      info: sinon.spy(),
    };
    const agent = this.agent = {
      gitdata: {
        createReference: sinon.stub().resolves(),
      },
      repos: {
        createRelease: sinon.stub().resolves(),
      },
    };
    const getGitAgent = this.getGitAgent = sinon.stub().returns(agent);
    const release = this.release = {};
    const getRelease = this.getRelease = sinon.stub().returns(release);
    const config = this.config = {
      options: {
        debug: false,
      },
    };
    const getConfig = this.getConfig = sinon.stub().returns(config);
    const gitHead = sinon.stub().resolves('my-sha');

    this.createGitTags = composeCreateGitTags(
      log,
      getGitAgent,
      getRelease,
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
      const { pkg, createGitTags, config, agent } = this;
      config.options.debug = true;
      const result = await createGitTags(pkg);

      expect(agent.gitdata.createReference.called).to.be.false;
    });
    it('creates a release', async function () {
      const { pkg, createGitTags, config, agent, release } = this;
      config.options.debug = true;
      const result = await createGitTags(pkg);

      expect(agent.repos.createRelease.called).to.be.true;
      expect(agent.repos.createRelease.calledWith(release)).to.be.true;
    });
  });
  context('when in release mode', function () {
    it('creates a reference', async function () {
      const { pkg, createGitTags, config, agent } = this;
      const result = await createGitTags(pkg);

      expect(agent.gitdata.createReference.called).to.be.true;
    });
    it('creates a release', async function () {
      const { pkg, createGitTags, config, agent, release } = this;
      const result = await createGitTags(pkg);

      expect(agent.repos.createRelease.called).to.be.true;
      expect(agent.repos.createRelease.calledWith(release)).to.be.true;
    });
  });
});
