// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeRunScripts from '../runScripts';

describe('post / runScripts', function(){
  it('runs pre scripts via lerna', function(){
    const shell = sinon.spy();
    const pkg = {
      name: 'package1',
      scripts: {
        postpublish: 'x',
        publish: 'z',
      },
      releaseType: 'initial',
    };
    const runScripts = composeRunScripts(shell);
    const expected = 'yarn lerna --scope=package1 run publish && yarn lerna --scope=package1 run postpublish';

    runScripts(pkg);

    expect(shell.called).to.be.true;
    const actual = shell.lastCall.args[0];

    expect(actual).to.equal(expected);
  });
  it('does not run unset scripts', function(){
    const shell = sinon.spy();
    const pkg = {
      name: 'package1',
      scripts: {
        postpublish: 'x',
      },
      releaseType: 'initial',
    };
    const runScripts = composeRunScripts(shell);
    const expected = 'yarn lerna --scope=package1 run postpublish';

    runScripts(pkg);

    expect(shell.called).to.be.true;
    const actual = shell.lastCall.args[0];

    expect(actual).to.equal(expected);
  });
  it('does not run if no scripts', function(){
    const shell = sinon.spy();
    const pkg = {
      name: 'package1',
      releaseType: 'initial',
    };
    const runScripts = composeRunScripts(shell);

    runScripts(pkg);

    expect(shell.called).to.be.false;
  });
  it('does not run if no release', function(){
    const shell = sinon.spy();
    const pkg = {
      name: 'package1',
      scripts: {
        postpublish: 'x',
        publish: 'z',
      },
    };
    const runScripts = composeRunScripts(shell);

    runScripts(pkg);

    expect(shell.called).to.be.false;
  });
});
