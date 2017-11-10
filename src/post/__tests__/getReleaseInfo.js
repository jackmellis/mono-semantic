// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeGetReleaseInfo from '../getReleaseInfo';

describe('post / getReleaseInfo', function(){
  beforeEach(function(){
    const config = this.config = {
      options: {
        branch: 'develop',
        debug: true,
      },
    };
    const getConfig = this.getConfig = sinon.stub().returns(config);
    const pkg = this.pkg = {
      scope: 'package1',
      version: '1.2.3',
      repository: {
        url: 'https://github.com/owner/repo',
      },
      changelog: 'changelog.md',
    };
    this.getReleaseInfo = composeGetReleaseInfo(getConfig);
  });


  it('returns a release object', function () {
    const { pkg, getReleaseInfo } = this;
    const result = getReleaseInfo(pkg);

    expect(result).to.be.instanceof(Object);
  });
  it('gets the owner and repo from the package', function () {
    const { pkg, getReleaseInfo } = this;

    const result = getReleaseInfo(pkg);

    expect(result.owner).to.equal('owner');
    expect(result.repo).to.equal('repo');
  });
  it('gets the tag_name and name from the package and version', function () {
    const { pkg, getReleaseInfo } = this;

    const result = getReleaseInfo(pkg);

    expect(result.tag_name).to.equal('package1@1.2.3');
    expect(result.name).to.equal('package1@1.2.3');
  });
  it('uses the changelog as the body', function () {
    const { pkg, getReleaseInfo } = this;

    const result = getReleaseInfo(pkg);

    expect(result.body).to.equal('changelog.md');
  });
  it('sets the target branch', function () {
    const { pkg, getReleaseInfo } = this;

    const result = getReleaseInfo(pkg);

    expect(result.target_committish).to.equal('develop');
  });
  it('sets the draft flag', function () {
    const { pkg, getReleaseInfo } = this;

    const result = getReleaseInfo(pkg);

    expect(result.draft).to.equal(true);
  });
});
