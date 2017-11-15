// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeRunScripts from '../runScripts';

describe('pre / runScripts', function(){
  it('runs pre scripts via lerna', function(){
    const shell = sinon.spy();
    const pkg = {
      name: 'package1',
    };
    const runScripts = composeRunScripts(shell);
    const expected = 'yarn lerna --scope=package1 run publish && yarn lerna --scope=package1 run postpublish';

    runScripts(pkg);

    expect(shell.called).to.be.true;
    const actual = shell.lastCall.args[0];

    expect(actual).to.equal(expected);
  });

});
