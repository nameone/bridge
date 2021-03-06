'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const storj = require('storj');
const Engine = require('..').Engine;
const Config = require('..').Config;
const Storage = require('..').Storage;
const Mailer = require('..').Mailer;
const Server = require('..').Server;

describe('Engine', function() {

  describe('@constructor', function() {

    it('should create instance without the new keyword', function() {
      expect(Engine(Config('__tmptest'))).to.be.instanceOf(Engine);
    });

    it('should keep reference to config', function() {
      var config = Config('__tmptest');
      var engine = new Engine(config);
      expect(engine._config).to.equal(config);
    });

  });

  describe('#getSpecification', function() {

    var config = Config('__tmptest');
    var engine = new Engine(config);

    it('should return the swagger specification', function() {
      var spec = engine.getSpecification();
      expect(typeof spec).to.equal('object');
    });

    it('should return the cached swagger specification', function() {
      expect(engine._apispec).to.equal(engine.getSpecification());
    });

  });

  describe('#start', function() {

    it('should setup storage, mailer, server, and network', function(done) {
      var config = Config('__tmptest');
      // TODO: Somewhere in the tests we aren't closing a server down
      config.network.port = 6484;
      var engine = new Engine(config);
      engine.start(function(err) {
        expect(err).to.equal(null);
        expect(engine.storage).to.be.instanceOf(Storage);
        expect(engine.mailer).to.be.instanceOf(Mailer);
        expect(engine.network).to.be.instanceOf(storj.Network);
        expect(engine.server).to.be.instanceOf(Server);
        engine.server.server.close(function() {
          done();
        });
      });
    });

    it('should report error if start fails', function(done) {
      var BadEngine = proxyquire('../lib/engine', {
        './network': {
          createInterface: sinon.stub().callsArgWith(1, new Error('Failed'))
        }
      });
      var engine = new BadEngine(Config('__tmptest'));
      engine.start(function(err) {
        expect(err.message).to.equal('Failed');
        done();
      });
    });

  });

});
