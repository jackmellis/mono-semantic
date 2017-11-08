// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import stream from 'stream';
import composeWriteChangelog from '../writeChangelog';

describe('plugins / generateNotes / writeChangelog', function(){
  beforeEach(function(){
    class WriteStream extends stream.Writable {
      _write(chunk, enc, next) {
        this.chunks = this.chunks || [];
        this.chunks.push(chunk);
        next();
      }
    }
    let data = 0;
    class ReadStream extends stream.Readable {
      _read () {
        // just emit some random events
        data++;
        setTimeout(() => {
          if (data > 3) {
            this.push(null);
            this.emit('close');
          } else {
            this.push(`data ${data}\n`, 'utf8');
          }
        }, 0);
      }
    }

    const fsWriteStream = this.fsWriteStream = new WriteStream();
    const changelogStream = this.changelogStream = new ReadStream();

    changelogStream.on('close', () => {
      // force a close of the write stream
      // not sure why this doesn't happen automatically
      fsWriteStream.emit('close');
    });

    const pkg = this.pkg = {
      scope: 'package1',
      physicalLocation: '/path/to/package',
      repository: {
        url: '/url/to/package',
      },
    };
    const releases = this.releases = [];
    const changelog = this.changelog = sinon.stub().callsFake((options) => {
      expect(options.preset).to.equal('angular');
      expect(options.pkg.path).to.equal('/path/to/package/package.json');
      expect(options.releaseCount).to.equal(0);
      return changelogStream;
    });
    const transformCommit = this.transformCommit = sinon.stub().returns('transformed');

    const fs = this.fs = {
      createWriteStream: sinon.stub().callsFake(() => {
        return fsWriteStream;
      }),
    };

    this.writeChangelog = composeWriteChangelog(
      changelog,
      transformCommit,
      fs
    );
  });
  it('returns a promise', function(){
    const { writeChangelog, pkg, releases } = this;
    const result = writeChangelog(pkg, releases);

    expect(result).to.be.instanceof(Promise);
  });

  it('uses conventional-changelog to generate a change log', async function(){
    const { changelog, writeChangelog, pkg, releases } = this;

    await writeChangelog(pkg, releases);

    expect(changelog.called).to.be.true;
  });
  it('writes to the changelog.md file', async function () {
    const { writeChangelog, fsWriteStream, fs } = this;

    await writeChangelog(this.pkg, this.releases);

    expect(fs.createWriteStream.called).to.be.true;
    expect(fs.createWriteStream.calledWith('/path/to/package/CHANGELOG.md', { flags: 'w' })).to.be.true;
    expect(fsWriteStream.chunks.length).to.equal(3);
  });
  it('transforms the commits', async function () {
    const {
      writeChangelog,
      changelog,
      transformCommit,
      pkg,
      releases,
      changelogStream,
    } = this;

    const cb = sinon.spy();
    const commit = {};

    changelog.callsFake(({ transform }) => {
      transform(commit, cb);
      return changelogStream;
    });

    await writeChangelog(pkg, releases);

    expect(transformCommit.called).to.be.true;
    expect(transformCommit.calledWith('package1', commit, releases)).to.be.true;
    expect(cb.called).to.be.true;
    expect(cb.calledWith(null, 'transformed')).to.be.true;
  });
});
