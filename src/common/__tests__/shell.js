// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeShell from '../shell';

describe('shell', function() {
  beforeEach(function(){
    this.shelljs = {
      exec: sinon.stub().returns('stdout'),
    };
    this.log = {
      verbose: sinon.spy(),
    };
    this.shell = composeShell(this.shelljs, this.log);
  });

  it('executes a shell command', function(){
    const {
      shell, shelljs,
    } = this;
    const options = {};

    const result = shell('git log', options);

    expect(result).to.equal('stdout');
    expect(shelljs.exec.called).to.be.true;
    expect(shelljs.exec.calledWith('git log', options));
  });

});
