/* eslint-env node, mocha */

import pg from 'pg';
import * as Hapi from 'hapi';
import chai from 'chai';
import chaiSubset from 'chai-subset';
import chaiAsPromised from 'chai-as-promised';
import Bluebird from 'bluebird';
import mergeOptions from 'merge-options';

import { Plump } from 'plump';
import { PGStore } from 'plump-store-postgres';
import { TestType } from 'plump/test/testType';
import { RestStore } from '../src/rest';
import { TestController } from './testController';

chai.use(chaiSubset);
chai.use(chaiAsPromised);
const expect = chai.expect;

function runSQL(command, opts = {}) {
  const connOptions = Object.assign(
    {},
    {
      user: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      charset: 'utf8',
    },
    opts
  );
  const client = new pg.Client(connOptions);
  return new Promise((resolve) => {
    client.connect((e1) => {
      if (e1) throw e1;
      client.query(command, (e2) => {
        if (e2) throw e2;
        client.end((e3) => {
          if (e3) throw e3;
          resolve();
        });
      });
    });
  });
}

function createDatabase(name) {
  return runSQL(`DROP DATABASE if exists ${name};`)
  .then(() => runSQL(`CREATE DATABASE ${name};`))
  .then(() => {
    return runSQL(`
      CREATE SEQUENCE testid_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        MAXVALUE 2147483647
        CACHE 1
        CYCLE;
      CREATE TABLE tests (
        id integer not null primary key DEFAULT nextval('testid_seq'::regclass),
        name text,
        "otherName" text default '',
        extended jsonb not null default '{}'::jsonb
      );
      CREATE TABLE parent_child_relationship (parent_id integer not null, child_id integer not null);
      CREATE UNIQUE INDEX children_join on parent_child_relationship (parent_id, child_id);
      CREATE TABLE valence_children (parent_id integer not null, child_id integer not null, perm integer not null);
      CREATE UNIQUE INDEX valence_children_join on valence_children (parent_id, child_id);
      CREATE TABLE query_children (parent_id integer not null, child_id integer not null, perm integer not null);
      CREATE UNIQUE INDEX query_children_join on query_children (parent_id, child_id);
    `, { database: name });
  });
}

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
    return createDatabase('plump_test_e2e')
    .then(() => {
      const terminal = new PGStore({
        sql: {
          connection: {
            database: 'plump_test_e2e',
            user: 'postgres',
            host: 'localhost',
            port: 5432,
          },
        },
        terminal: true,
      });
      const backendPlump = new Plump({ types: [TestType], storage: [terminal] });

      return server.register(new TestController(backendPlump, TestType).plugin, TestController.hapiOptions);
    })
    .then(() => {
      return server.start(() => console.log('Test server listening...'));
    });
  });

  after(() => {
    // return server.stop(() => console.log('Test server stopped.'));
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
      .then(saved => expect(saved).to.have.property(TestType.$id, saved.id));
    });

    it('R', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(saved => {
        return expect(frontendPlump.find(TestType, one.$id).$get())
          .to.eventually.deep.equal(
            mergeOptions(
              {},
              TestType.assign(sampleData),
              {
                id: saved.id,
                attributes: {
                  id: saved.id,
                },
              }
            )
          );
      });
    });

    it('U', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(() => one.$set({ name: 'frotato' }).$save())
      .then(() => expect(frontendPlump.find(TestType, one.$id).$get())
        .to.eventually.have.deep.property('attributes.name', 'frotato'));
    });

    it('D', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(saved => expect(frontendPlump.find(TestType, one.$id).$get())
        .to.eventually.deep.equal(
          mergeOptions(
            {},
            TestType.assign(sampleData),
            {
              id: saved.id,
              attributes: {
                id: saved.id,
              },
            }
          )
        )
      )
      .then(() => one.$delete())
      .then(() => expect(frontendPlump.find(TestType, one.$id).$get()).to.eventually.be.null);
    });
  });

  describe('relationship CRUD', () => {
    it('C', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(() => one.$add('children', 100).$save())
      .then(() => one.$get())
      .then(() => expect(frontendPlump.find(TestType, one.$id).$get())
        .to.eventually.have.property('relationships')
        .that.deep.containSubset({ children: [{ id: 100 }] }))
      .catch(err => {
        // console.log(err);
        throw err;
      });
    });

    it('R', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(() => one.$add('children', 101).$save())
      .then(self => expect(frontendPlump.find(TestType, one.$id).$get('children'))
      .to.eventually.deep.containSubset({
        type: TestType.$name,
        id: self.id,
        relationships: {
          children: [{ id: 101 }],
        },
      }));
    });

    it('U', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(() => one.$add('valenceChildren', 102, { perm: 2 }).$save())
      .then(() => expect(frontendPlump.find(TestType, one.$id).$get('valenceChildren'))
        .to.eventually.have.deep.property('relationships.valenceChildren')
        .that.deep.containSubset([{ id: 102, meta: { perm: 2 } }]))
      .then(() => one.$modifyRelationship('valenceChildren', 102, { perm: 3 }))
      .then(() => expect(one.$get('valenceChildren')));
    });

    it('D', () => {
      const one = new TestType(sampleData, frontendPlump);
      return one.$save()
      .then(() => one.$add('children', 103).$save())
      .then(() => expect(one.$get('children'))
        .to.eventually.have.deep.property('relationships.children')
        .that.deep.containSubset([{ id: 103 }]))
      .then(() => one.$remove('children', 103).$save())
      .then(() => expect(one.$get('children'))
        .to.eventually.have.deep.property('relationships.children')
        .that.is.empty);
    });
  });
});
