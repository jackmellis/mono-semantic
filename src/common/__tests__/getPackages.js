// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import path from 'path';
import composeGetPackages, { type GetPackages } from '../getPackages';

describe('common / getPackages', function(){
  beforeEach(function(){
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

        return JSON.stringify({
          name: `@my-scope/${scope}`,
        });
      }),
    };
    const userConfig = this.userConfig = {
      pathToPackages: '/path/to/packages',
    };
    this.getPackages = composeGetPackages(fs, userConfig);
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

    expect(pkg.name).to.equal('@my-scope/package-3');
  });
  it('sorts the packages based on inter-dependency', function() {
    const { getPackages } = this;
    const result = getPackages().map((pkg) => pkg.scope);
    const expected = [
      'package-3',
      'package-2',
      'package-1',
    ];

    expect(result).to.deep.equal(expected);
  });
  it('appends a location and scope', function() {
    const { getPackages } = this;
    const result = getPackages()[0];

    expect(result.physicalLocation).to.equal('/path/to/packages/package-3');
    expect(result.scope).to.equal('package-3');
  });
});
