// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import path from 'path';
import composeGetPackages, { type GetPackages } from '../getPackages';

describe('common / getPackages', function(){
  beforeEach(function(){
    this.createPackage = (scope, dependencies) => ({
      name: `@my-scope/${scope}`,
      dependencies,
      repository: {
        url: `https://github.com/my-scope/${scope}`,
      },
    });
    const log = {
      verbose : sinon.spy(),
      info: sinon.spy(),
      warn: sinon.spy(),
    };
    const fs = this.fs = {
      readdirSync: sinon.stub().returns([
        'package-1',
        'package-2',
        'package-3',
      ]),
      readFileSync: sinon.stub().callsFake((target) => {
        const scope = target
          .replace('/path/to/packages/', '')
          .replace('/package.json', '');
        const dependencies = {};

        switch (scope){
        case 'package-1':
          dependencies['@my-scope/package-2'] = 'link:../package-2';
          break;
        case 'package-2':
          break;
        case 'package-3':
          dependencies['@my-scope/package-1'] = 'link:../package-1';
          break;
        default:
          break;
        }

        return JSON.stringify(this.createPackage(scope, dependencies));
      }),
    };
    const userConfig = this.userConfig = {
      pathToPackages: '/path/to/packages',
    };
    this.getPackages = composeGetPackages(fs, userConfig, log);
  });
  it('reads packages from the package path directory', function() {
    const {
      getPackages, fs, userConfig,
    } = this;
    getPackages();

    expect(fs.readdirSync.called).to.be.true;
    expect(fs.readdirSync.calledWith(userConfig.pathToPackages)).to.be.true;
  });
  it('returns an array of packages', function(){
    const { getPackages } = this;
    const result = getPackages();

    expect(result).to.be.instanceof(Array);
    expect(result.length).to.equal(3);

    const pkg = result[0];

    expect(pkg.name).to.equal('@my-scope/package-2');
  });
  it('sorts the packages based on inter-dependency', function() {
    const { getPackages } = this;
    const result = getPackages().map((pkg) => pkg.scope);
    const expected = [
      'package-2',
      'package-1',
      'package-3',
    ];

    expect(result).to.deep.equal(expected);
  });
  it('appends a location and scope', function() {
    const { getPackages } = this;
    const result = getPackages()[0];

    expect(result.physicalLocation).to.equal('/path/to/packages/package-2');
    expect(result.scope).to.equal('package-2');
  });
  it('errors if package has no name', function () {
    this.createPackage = (scope, dependencies) => ({
      dependencies,
      repository: {
        url: '/x/y/z',
      },
    });

    expect(() => this.getPackages()).to.throw();
  });
  it('errors if package has no repo url', function () {
    this.createPackage = (scope, dependencies) => ({
      name: scope,
      dependencies,
    });

    expect(() => this.getPackages()).to.throw();
  });
});
