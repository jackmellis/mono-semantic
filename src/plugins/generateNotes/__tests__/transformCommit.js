// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeTransformCommit from '../transformCommit';

describe('plugins / generateNotes / transformCommit', function(){
  beforeEach(function(){
    this.isValidCommit = sinon.stub().returns(true);
    this.transformCommit = composeTransformCommit(this.isValidCommit);
    this.scope = 'package1';
    this.commit = {
      header: 'fix(package1): a commit message',
      hash: '123456789',
    };
    this.releases = [
      {
        commit: '987564321',
        version: '1.2.3',
      },
    ];
  });


  context('when commit is linked to a release tag', function () {
    it('adds a version property', function(){
      const {
        transformCommit,
        scope,
        commit,
        releases,
      } = this;
      releases[0].commit = commit.hash;

      const result = transformCommit(scope, commit, releases);

      expect(result.version).to.equal(releases[0].version);
    });
  });
  context('when commit is not within the package scope', function () {
    it('returns null', function () {
      const {
        transformCommit,
        scope,
        commit,
        releases,
        isValidCommit,
      } = this;
      releases[0].commit = commit.hash;
      isValidCommit.returns(false);

      const result = transformCommit(scope, commit, releases);

      expect(result).to.equal(null);
    });
  });
  context('when commit is relevant', function () {
    it('returns the original commit', function(){
      const {
        transformCommit,
        scope,
        commit,
        releases,
      } = this;

      const result = transformCommit(scope, commit, releases);

      expect(result).to.equal(commit);
      expect(result.version).to.be.undefined;
    });

  })
});
