// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeGenerateChangelog from '../generateChangelog';

describe('post / generateChangelog', function(){
beforeEach(function(){
  const pkg = this.pkg = {};
  const config = this.config = {
    plugins: {
      generateNotes: sinon.stub().callsFake((c, cb) => {
        setImmediate(() => {
          cb(null, 'changelog.md');
        });
      }),
    },
  };
  const getConfig = this.getConfig = sinon.stub().returns(config);

  this.generateChangelog = composeGenerateChangelog(getConfig);
});


  it('returns a promise', function () {
    const { pkg, generateChangelog } = this;
    const result = generateChangelog(pkg);

    expect(result).to.be.instanceof(Promise);
  });
  it('calls generateNotes', function () {
    const { pkg, config, getConfig, generateChangelog } = this;
    generateChangelog(pkg);

    expect(config.plugins.generateNotes.called).to.be.true;
    expect(config.plugins.generateNotes.calledWith(config, sinon.match.func)).to.be.true;
  });
  it('resolves the generated notes', async function () {
    const { pkg, generateChangelog } = this;

    const result = await generateChangelog(pkg);

    // expect(result).to.equal('changelog.md');
    expect(result.changelog).to.equal('changelog.md');
  });
});
