// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeGetPackageReleases from '../getPackageReleases';

describe('commits / getPackageReleases', function(){
  beforeEach(function(){
    const versionToCommit = sinon.stub().callsFake((n, v) => {
      switch (v){
      case '1.0.0':
        return '123';
      case '1.1.0':
        return '456';
      case '1.1.1':
        return '789';
      default:
        return 'unexpected version';
      }
    });
    const shell = sinon.stub().callsFake(() => {
      return `
package1@1.0.0
package1@1.1.0
package1@1.1.1
`;
    });
    const getNpmRegistry = sinon.stub().returns('my-registry');
    this.getPackageReleases = composeGetPackageReleases(
      versionToCommit,
      shell,
      getNpmRegistry,
    );
    this.pkg = {};
  });

  it('returns a promise', function() {
    const result = this.getPackageReleases(this.pkg);

    expect(result).to.be.instanceof(Promise);
  });
  it('returns an array of versions of the current package', function(done){
    this.getPackageReleases(this.pkg).then((result) => {
      expect(result).to.be.instanceof(Array);
      expect(result.length).to.equal(3);
      const versions = result.map((r) => r.version);
      const expected = [
        '1.0.0',
        '1.1.0',
        '1.1.1',
      ];
      expect(versions).to.deep.equal(expected);
      done();
    });
  });
  it('contains a commit hash and tag for each version', function(done) {
    this.getPackageReleases(this.pkg).then((result) => {
      const hashes = result.map((r) => r.commit);
      const scopes = result.map((r) => r.scope);
      const tags = result.map((r) => r.tag);

      expect(hashes).to.deep.equal([ '123', '456', '789' ]);
      expect(scopes).to.deep.equal([ 'package1', 'package1', 'package1' ]);
      expect(tags).to.deep.equal([ 'package1@1.0.0', 'package1@1.1.0', 'package1@1.1.1' ]);
      done();
    });
  });
});
