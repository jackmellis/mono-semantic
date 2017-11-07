// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import composeAnalyzeCommits from '../analyzeCommits';

describe('plugins / analyzeCommits / analyzeCommits', function () {
  it('starts commit analyzer with filters relative to the current scope', function(){
    const log = {
      verbose: sinon.spy(),
      info: sinon.spy(),
    };
    const filterValidCommits = sinon.stub().callsFake((s, c) => c);
    const analyzer = sinon.stub();
    const pluginConfig = {
      scope: 'package1',
    };
    const config = {
      commits: [
        {}
      ],
    };
    const done = sinon.spy();

    const analyzeCommits = composeAnalyzeCommits(
      log,
      filterValidCommits,
      analyzer
    );

    analyzeCommits(pluginConfig, config, done);

    expect(analyzer.called).to.be.true;
    expect(analyzer.calledWith(pluginConfig, config, done)).to.be.true;
  });

});
