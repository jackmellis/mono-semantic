// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeUpdateGitHead from '../updateGitHead';

describe('publish / updateGitHead', function(){
  it('adds a gitHead property to the package', async function(){
    const gitHead = sinon.stub().resolves('commit-hash');
    const pkg = {
      releaseType: 'initial',
    };
    const updateGitHead = composeUpdateGitHead(gitHead);

    const result = await updateGitHead(pkg);

    expect(result.gitHead).to.equal('commit-hash');
  });
});
