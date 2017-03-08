/* eslint-env node, mocha */

import * as Hapi from 'hapi';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Bluebird from 'bluebird';

import { Plump, MemoryStore } from 'plump';
import { RestStore } from '../src/rest';
import { TestType } from './testType';
import { TestController } from './testController';


const expect = chai.expect;
chai.use(chaiAsPromised);

const terminal = new MemoryStore({ terminal: true });
const backendPlump = new Plump({ types: [TestType], storage: [terminal] });
const hapi = Bluebird.promisifyAll(Hapi);
const server = new hapi.Server({
  debug: {
    log: ['error'],
  },
});

server.connection({
  host: 'localhost',
  port: 5000,
});

const rest = new RestStore({
  baseURL: 'http://localhost:5000/api/tests',
  schemata: [TestType.$schema],
  terminal: true,
});
const frontendPlump = new Plump({ types: [TestType], storage: [rest] });

describe('Plump Rest Integration', () => {
  before(() => {
    return server.register(new TestController(backendPlump, TestType).plugin, TestController.hapiOptions)
    .then(() => {
      server.start(() => console.log('rollin'));
    });
  });

  describe('Server', () => {
    it('should 404 for nonexistent routes', () => {
      return expect(server.inject('/')).to.eventually.have.property('statusCode', 404);
    });
  });

  describe('Basic CRUD', () => {
    it('C');
    it('R');
    it('U');
    it('D');
  });

  describe('Relationship CRUD', () => {
    it('C');
    it('R');
    it('U');
    it('D');
  });
});
