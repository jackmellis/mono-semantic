// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeGetGitAgent from '../getGitAgent';

describe('post / getGitAgent', function(){
  beforeEach(function(){
    const pkg = this.pkg = {};
    const api = this.api = {
      authenticate: sinon.spy(),
    };
    const config = this.config = {
      options: {
        githubUrl: 'https://github.com:6543/myorg/myrepo',
        githubToken: 'my-git-token',
        githubApiPathPrefix: 'prefix',
      }
    };
    const createGitAgent = this.createGitAgent = sinon.stub().returns(api);
    const getConfig = this.getConfig = sinon.stub().returns(config);

    const getGitAgent = this.getGitAgent = composeGetGitAgent(
      createGitAgent,
      getConfig
    );
  });


  it('returns a new github api', function () {
    const { getGitAgent, createGitAgent, api, pkg } = this;

    const result = getGitAgent(pkg);

    expect(createGitAgent.called).to.be.true;
    expect(result).to.equal(api);
  });
  it('authenticates using the github token', function () {
    const { getGitAgent, pkg, api } = this;

    getGitAgent(pkg);

    expect(api.authenticate.called).to.be.true;
    expect(api.authenticate.calledWith({
      type: 'token',
      token: 'my-git-token',
    })).to.be.true;
  });
  it('uses the port, protocol and hostname of the url', function () {
    const { getGitAgent, pkg, createGitAgent } = this;

    getGitAgent(pkg);

    const arg = createGitAgent.lastCall.args[0];

    expect(arg.port).to.equal('6543');
    expect(arg.host).to.equal('github.com');
    expect(arg.protocol).to.equal('https');
  });
  it('sets the pathPrefix if available', function () {
    const { getGitAgent, pkg, createGitAgent } = this;

    getGitAgent(pkg);

    const arg = createGitAgent.lastCall.args[0];

    expect(arg.pathPrefix).to.equal('prefix');
  });
  it('defaults pathPrefix to null', function () {
    const { getGitAgent, pkg, createGitAgent, config } = this;
    delete config.options.githubApiPathPrefix;

    getGitAgent(pkg);

    const arg = createGitAgent.lastCall.args[0];

    expect(arg.pathPrefix).to.equal(null);
  });
});
