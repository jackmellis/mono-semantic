// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeGenerateNotes from '../generateNotes';

describe('plugins / generateNotes / generateNotes', function () {
  beforeEach(function(){
    const log = this.log = {
      info: sinon.spy(),
    };
    const fs = this.fs = {
      readFile: sinon.stub().callsFake((t, e, cb) => {
        cb(null, 'changelog')
      }),
    };
    const getPackageReleases = this.getPackageReleases = sinon.stub().resolves([]);
    const writeChangelog = this.writeChangelog = sinon.stub().resolves();
    this.generateNotes = composeGenerateNotes(
      log,
      fs,
      getPackageReleases,
      writeChangelog,
    );
    this.pluginConfig = {
      scope: 'package1',
    };
    this.config = {
      pkg: {
        physicalLocation: '/path/to/package',
      },
    };
  });


  it('generates a change log', function (done) {
    this.generateNotes(this.pluginConfig, this.config, (err, log) => {
      expect(typeof log).to.equal('string');
      expect(log).to.equal('changelog');
      done();
    });
  });
});
