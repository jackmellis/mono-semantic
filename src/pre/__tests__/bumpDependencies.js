// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeBumpDependencies from '../bumpDependencies';

describe('pre / bumpDependencies', function(){
  beforeEach(function(){
    this.log = {
      verbose: sinon.spy(),
      info: sinon.spy(),
    };
    this.bumpDependencies = composeBumpDependencies(this.log);
    this.allPackages = [
      {
        name: 'package1',
        version: '1.0.0',
        dependencies: {
          external: '^0.1.0',
          package2: 'link:../package2',
          package3: '^1.0.0',
        },
      },
      {
        name: 'package2',
        version: '1.2.3',
        dependencies: {
          external: '^0.2.0',
          ramda: '^0.25.0',
        },
      },
      {
        name: 'package3',
        version: '2.0.0',
        dependencies: {},
      }
    ];
    this.pkg = this.allPackages[0];
  });


  it('updates all internal dependencies to the latest version', function(){
    const {
      bumpDependencies,
      allPackages,
      pkg,
    } = this;

    const result = bumpDependencies(allPackages, pkg);

    expect(result).not.to.equal(pkg);
    expect(result.dependencies).to.deep.equal({
      external: '^0.1.0',
      package2: '1.x.x',
      package3: '2.x.x',
    });
  });
  it('returns the original package if no changes are made', function () {
      const {
        bumpDependencies,
        allPackages,
      } = this;

      const pkg = allPackages[1];

      const result = bumpDependencies(allPackages, pkg);

      expect(result).to.equal(pkg);
  });
});
