// @flow
import { expect } from 'chai';
import sinon from 'sinon';
import path from 'path';
import {
  getUserConfig,
  getNpmConfig,
  getNpmRegistry,
  getNpm,
  getSemanticReleasePlugins,
  getSemanticReleaseOptions,
  getSemanticReleaseConfig,
} from '../config';

describe('common / config ', function() {

  beforeEach(function(){
    this.npmlog = {
      verbose: sinon.spy(),
    };
  });


  describe('getUserConfig', function() {
    it('returns user config', function(){
      const result = getUserConfig()();

      expect(result).to.be.instanceof(Object);
    });
    it('returns default values', function() {
      const result = getUserConfig({})();
      const expectedPath = path.join(path.resolve('.'), 'packages');

      expect(result.pathToPackages).to.equal(expectedPath);
    });
    it('user config overrides defaults', function() {
      const expectedPath = '/usr/packages';
      const result = getUserConfig({ pathToPackages: expectedPath })();

      expect(result.pathToPackages).to.equal(expectedPath);
    });
  });

  describe('getNpmConfig', function() {
    beforeEach(function() {
      this.shell = sinon.stub().returns('{"registry":"test-registry.com"}');
      this.getNpmConfig = getNpmConfig(this.shell);
    });
    it('returns the npm config', function(){
      const { getNpmConfig } = this;
      const result = getNpmConfig();

      expect(result).to.be.instanceof(Object);
      expect(result.registry).to.equal('test-registry.com');
    });
  });

  describe('getNpmRegistry', function() {
    beforeEach(function() {
      this.npmconfig = {
        '@my-scope:registry': 'scope-registry',
        'registry': 'config-registry',
      };
      this.getNpmRegistry = getNpmRegistry(this.npmconfig);
      this.pkg = {
        name: '@my-scope/my-package',
        publishConfig: {
          registry: 'package-registry',
        },
      };
    });
    it('returns the package.json registry', function(){
      const {
        getNpmRegistry, pkg,
      } = this;
      const result = getNpmRegistry(pkg);

      expect(result).to.equal(pkg.publishConfig.registry);
    });
    it('returns the registry from the global npm config', function() {
      const {
        getNpmRegistry, pkg, npmconfig,
      } = this;
      delete pkg.publishConfig.registry;
      pkg.name = 'my-package';
      const result = getNpmRegistry(pkg);

      expect(result).to.equal(npmconfig.registry);
    });
    it('returns the registry of the package scope', function() {
      const {
        getNpmRegistry, pkg, npmconfig,
      } = this;
      delete pkg.publishConfig;
      const result = getNpmRegistry(pkg);

      expect(result).to.equal(npmconfig['@my-scope:registry']);
    });
    it('ignores the scope if not registered', function() {
      const {
        getNpmRegistry, pkg, npmconfig,
      } = this;
      delete pkg.publishConfig.registry;
      delete npmconfig['@my-scope:registry'];
      const result = getNpmRegistry(pkg);

      expect(result).to.equal(npmconfig.registry);
    });
    it('defaults to npm', function() {
      const {
        getNpmRegistry, pkg, npmconfig,
      } = this;
      delete pkg.publishConfig;
      delete npmconfig['@my-scope:registry'];
      delete npmconfig.registry;
      const result = getNpmRegistry(pkg);

      expect(result).to.equal('https://registry.npmjs.org');
    });
  });

  describe('getNpm', function() {
    beforeEach(function() {
      this.npmconfig = {
        loglevel: 'info',
        tag: 'future',
      };
      this.getRegistry = sinon.stub().returns('my-registry');
      this.pkg = {
        publishConfig: {
          tag: 'next',
        },
      };
      this.getNpm = getNpm(
        this.npmlog,
        this.npmconfig,
        this.getRegistry,
      );
    });

    it('returns an object', function(){
      const result = this.getNpm(this.pkg);

      expect(result).to.be.instanceof(Object);
    });
    it('contains the package registry', function() {
      const {
        getNpm, getRegistry, pkg,
      } = this;
      const { registry } = getNpm(pkg);

      expect(getRegistry.called).to.be.true;
      expect(registry).to.equal('my-registry');
    });
    describe('loglevel', function() {
      it('is fetched from the npm config', function() {
        const {
          getNpm, npmconfig, pkg,
        } = this;
        const { loglevel } = getNpm(pkg);

        expect(loglevel).to.equal(npmconfig.loglevel);
      });
      it('defaults to warn', function() {
        const {
          getNpm, npmconfig, pkg,
        } = this;
        delete npmconfig.loglevel;
        const { loglevel } = getNpm(pkg);

        expect(loglevel).to.equal('warn');
      });
    });
    describe('tag', function() {
      it('uses the package config tag', function() {
        const {
          getNpm, pkg,
        } = this;
        const { tag } = getNpm(pkg);

        expect(tag).to.equal(pkg.publishConfig.tag);
      });
      it('uses the npm config tag', function() {
        const {
          getNpm, pkg, npmconfig,
        } = this;
        delete pkg.publishConfig.tag;
        const { tag } = getNpm(pkg);

        expect(tag).to.equal(npmconfig.tag);
      });
      it('defaults to latest', function() {
        const {
          getNpm, pkg, npmconfig,
        } = this;
        delete pkg.publishConfig;
        delete npmconfig.tag;
        const { tag } = getNpm(pkg);

        expect(tag).to.equal('latest');
      });
    });
  });

  describe('getSemanticReleasePlugins', function() {
    beforeEach(function() {
      this.createPlugins = sinon.stub().callsFake((v) => v);
      this.getSemanticReleasePlugins = getSemanticReleasePlugins(this.createPlugins);
    });
    it('calls create plugins', function(){
      const {
        createPlugins, getSemanticReleasePlugins,
      } = this;
      getSemanticReleasePlugins({});

      expect(createPlugins.called).to.be.true;
    });
    it('defaults analyzeCommits and generateNotes', function() {
      const { getSemanticReleasePlugins } = this;
      const result = getSemanticReleasePlugins({ scope: 'my-scope' });

      expect(result.analyzeCommits).not.to.be.undefined;
      expect(typeof result.analyzeCommits.path).to.equal('string');
      expect(result.analyzeCommits.scope).to.equal('my-scope');

      expect(result.generateNotes).not.to.be.undefined;
      expect(typeof result.generateNotes.path).to.equal('string');
      expect(result.generateNotes.scope).to.equal('my-scope');
    });
    it('uses package-specific plugins if available', function() {
      const { getSemanticReleasePlugins } = this;
      const pkg = {
        scope: 'my-scope',
        release: {
          analyzeCommits: 'use-this-instead',
          someOtherPlugin: 'use-this-too',
        },
      };
      const result = getSemanticReleasePlugins(pkg);

      expect(result.analyzeCommits).to.equal('use-this-instead');
      expect(result.someOtherPlugin).to.equal('use-this-too');
    });
  });

  describe('getSemanticReleaseOptions', function() {
    it('returns default options', function(){
      const env = {
        GH_TOKEN: 'github-token',
        GH_URL: 'github-url',
      };
      const fn = getSemanticReleaseOptions(env);
      const pkg = {};
      const result = fn(pkg);

      expect(result).to.be.instanceof(Object);
      expect(result.branch).to.equal('master');
      expect(result.githubToken).to.equal(env.GH_TOKEN);
      expect(result.githubUrl).to.equal(env.GH_URL);
    });
    it('merges options with package-specific options', function(){
      const pkg = {
        release: {
          branch: 'develop',
          debug: false,
          githubToken: 'xxxx',
        },
      };
      const result = getSemanticReleaseOptions({})(pkg);

      expect(result.branch).to.equal('develop');
      expect(result.debug).to.be.false;
      expect(result.githubToken).to.equal('xxxx');
    });
    context('when in CI', function() {
      it('sets debug to false', function() {
        const env = {
          CI: true,
        };
        const result = getSemanticReleaseOptions(env)({});

        expect(result.debug).to.be.false;
      });
    });
    context('when in development', function() {
      it('sets debug to true', function() {
        const env = {
          CI: false,
        };
        const result = getSemanticReleaseOptions(env)({});

        expect(result.debug).to.be.true;
      });
    });
  });

  describe('getSemanticReleaseConfig', function() {
    beforeEach(function() {
      this.getNpm = sinon.stub().returns({ npm: true });
      this.getSemanticReleasePlugins = sinon.stub().returns({ plugins: true });
      this.getSemanticReleaseOptions = sinon.stub().returns({ options: true });
      this.env = { env: true };
      this.pkg = { pkg: true };

      this.getSemanticReleaseConfig = getSemanticReleaseConfig(
        this.getNpm,
        this.getSemanticReleasePlugins,
        this.getSemanticReleaseOptions,
        this.env,
      );
    });

    it('returns an object containing all configuration settings', function(){
      const {
        getSemanticReleaseConfig, pkg,
      } = this;
      const expected = {
        npm: {
          npm: true,
        },
        plugins: {
          plugins: true,
        },
        options: {
          options: true,
        },
        env: {
          env: true,
        },
        pkg: {
          pkg: true,
        },
      };
      const result = getSemanticReleaseConfig(pkg);

      expect(result).to.deep.equal(expected);
    });
  });
});
