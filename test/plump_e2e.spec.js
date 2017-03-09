/* eslint-env node, mocha */

import * as Hapi from 'hapi';
import chai from 'chai';
import chaiSubset from 'chai-subset';
import chaiAsPromised from 'chai-as-promised';
import Bluebird from 'bluebird';

import { Plump, MemoryStore } from 'plump';
import { TestType } from 'plump/test/testType';
import { RestStore } from '../src/rest';
import { TestController } from './testController';


chai.use(chaiSubset);
chai.use(chaiAsPromised);
const expect = chai.expect;

const sampleData = {
  type: 'tests',
  attributes: {
    name: 'potato',
    extended: {
      actual: 'rutabaga',
      otherValue: 42,
    },
  },
  relationships: {},
};

describe('Plump Rest Integration', () => {
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
    baseURL: 'http://localhost:5000/api',
    schemata: [TestType.$schema],
    terminal: true,
  });
  const frontendPlump = new Plump({ types: [TestType], storage: [rest] });

  before(() => {
    return server.register(new TestController(backendPlump, TestType).plugin, TestController.hapiOptions)
    .then(() => {
      return server.start(() => console.log('rollin'));
    });
  });

  describe('Server', () => {
    it('should 404 for nonexistent routes', () => {
      return expect(server.inject('/')).to.eventually.have.property('statusCode', 404);
    });
  });

  describe('attribute CRUD', () => {
    it('C', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(saved => expect(saved).to.have.property(TestType.$id, saved.$id));
    });

    it('R', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(saved => expect(one.$get()).to.eventually.deep.equal(Object.assign({}, sampleData, { id: saved.$id })));
    });

    it('U', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(() => one.$set({ name: 'frotato' }).$save())
      .then(() => expect(one.$get()).to.eventually.have.deep.property('attributes.name', 'frotato'));
    });

    it('D', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(saved => expect(one.$get()).to.eventually.deep.equal(Object.assign({}, sampleData, { id: saved.$id })))
      .then(() => one.$delete())
      .then(() => expect(one.$get()).to.eventually.be.null);
    });
  });

  describe('relationship CRUD', () => {
    it('C', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(() => one.$add('children', 100).$save())
      .then(() => expect(one.$get())
        .to.eventually.have.property('relationships')
        .that.deep.equals({ children: [{ id: 100 }] }));
    });

    it('R', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(() => one.$add('children', 101).$save())
      .then(self => expect(one.$get('children'))
      .to.eventually.deep.equal({
        type: TestType.$name,
        id: self.$id,
        relationships: {
          children: [{ id: 101 }],
        },
      }));
    });

    it('U', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(() => one.$add('children', 102, { perm: 2 }).$save())
      .then(() => expect(one.$get('children'))
        .to.eventually.have.deep.property('relationships.children')
        .that.deep.equals([{ id: 102, meta: { perm: 2 } }]))
      .then(() => one.$modifyRelationship('children', 102, { perm: 3 }))
      .then(() => expect(one.$get('children')));
    });

    it('D', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(() => one.$add('children', 103).$save())
      .then(() => expect(one.$get('children'))
        .to.eventually.have.deep.property('relationships.children')
        .that.deep.equals([{ id: 103 }]))
      .then(() => one.$remove('children', 103).$save())
      .then(() => expect(one.$get('children'))
        .to.eventually.have.deep.property('relationships.children')
        .that.is.empty);
    });
  });
});
