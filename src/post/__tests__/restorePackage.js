// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeRestorePackage from '../restorePackage';

const restorePackage = composeRestorePackage({
  info: sinon.spy(),
  verbose: sinon.spy(),
});

describe('post / restorePackage', function(){
  beforeEach(function(){
    const packages = this.packages = [
      {
        name: '@scope/package1',
        scope: 'package1',
        version: '2.0.0',
        releaseType: 'major',
        gitHead: 'sha123',
        changelog: 'some change happened',
        dependencies: {
          '@scope/package2': '1.2.3',
          'ramda': '0.25.0',
        },
      },
      {
        name: '@scope/package2',
        scope: 'package2',
      },
    ];
  });

  it('resets all dependencies back to links', function () {
    const result = restorePackage(this.packages, this.packages[0]);
    const expected = {
      '@scope/package2': 'link:../package2',
      'ramda': '0.25.0',
    };

    expect(result.dependencies).to.deep.equal(expected);
  });
  it('removes spurious properties', function () {
    const result = restorePackage(this.packages, this.packages[0]);
    delete result.dependencies;
    const expected = {
      name: '@scope/package1',
      scope: 'package1',
      version: '0.0.0',
    };

    expect(result).to.deep.equal(expected);
  });
});
