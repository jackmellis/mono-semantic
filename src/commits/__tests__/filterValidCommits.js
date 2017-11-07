// @flow
import { expect } from 'chai';
import filterValidCommits from '../filterValidCommits';

describe('commits / filterValidCommits', function() {
  it('strips non-relevant commits from the config', function(){
    const commits = [
      {
        message: 'feat(package1): did some stuff',
      },
      {
        message: 'feat(package2): did some other stuff',
      },
      {
        message: 'feat: no scope here',
      },
      {
        message: 'fix(package1): more changes',
      },
    ];
    const config = { commits };
    const scope = 'package1';

    const result = filterValidCommits(scope, config);

    expect(result.commits.length).to.equal(2);
  });
  it('does not mutate the original config', function() {
    const commits = [
      {
        message: 'feat(package1): did some stuff',
      },
      {
        message: 'feat(package2): did some other stuff',
      },
      {
        message: 'feat: no scope here',
      },
      {
        message: 'fix(package1): more changes',
      },
    ];
    const config = { commits };
    const scope = 'package1';

    const result = filterValidCommits(scope, config);

    expect(result).not.to.equal(config);
    expect(result).not.to.deep.equal(config);
  });
});
