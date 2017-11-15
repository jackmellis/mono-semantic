// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeRunScripts from '../runScripts';

describe('pre / runScripts', function(){
  it('runs pre scripts via lerna', function(){
    const shell = sinon.spy();
    const pkg = {
      name: 'package1',
      scripts: {
        prepare: 'y',
        prepublish: 'x',
        prepublishOnly: 'z',
      },
      releaseType: 'initial',
    };
    const runScripts = composeRunScripts(shell);
    const expected = 'yarn lerna --scope=package1 run prepublish && yarn lerna --scope=package1 run prepare && yarn lerna --scope=package1 run prepublishOnly';

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
        prepublish: 'x',
      },
      releaseType: 'initial',
    };
    const runScripts = composeRunScripts(shell);
    const expected = 'yarn lerna --scope=package1 run prepublish';

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
        prepare: 'y',
        prepublish: 'x',
        prepublishOnly: 'z',
      },
    };
    const runScripts = composeRunScripts(shell);

    runScripts(pkg);

    expect(shell.called).to.be.false;
  });
});
