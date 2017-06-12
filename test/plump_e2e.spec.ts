/* eslint-env node, mocha */

import * as Hapi from 'hapi';
import * as pg from 'pg';
import * as chai from 'chai';

import { Plump } from 'plump';
import { PGStore } from 'plump-store-postgres';
import { TestType } from './testType';
import { RestStore } from '../src/rest';
import { StrutServer } from 'plump-strut';

import * as SocketIO from 'socket.io-client';

import 'mocha';

declare global {
  namespace Chai {
    interface Assertion {
      nested: Assertion;
    }
  }
}

const TEST_PORT = parseInt(process.env.TEST_PORT, 10) || 4000;

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
      if (e1) { throw e1; }
      client.query(command, (e2) => {
        if (e2) { throw e2; }
        client.end((e3) => {
          if (e3) { throw e3; }
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
  name: 'potato',
  extended: {
    actual: 'rutabaga',
    otherValue: 42,
  },
};

describe('Plump Rest Integration', () => {

  const context = {
    rest: new RestStore({
      baseURL: `http://localhost:${TEST_PORT}/api`,
      terminal: true,
    }),
    frontendPlump: new Plump(),
    backendPlump: new Plump(),
    strut: null,
  };

  before(() => {
    return createDatabase('plump_test_e2e')
    .then(() => {
      const terminal = new PGStore({
        sql: {
          // debug: true,
          connection: {
            database: 'plump_test_e2e',
            user: 'postgres',
            host: 'localhost',
            port: 5432,
          },
        },
        terminal: true,
      });
      return context.backendPlump.setTerminal(terminal);
    })
    .then(() => context.backendPlump.addType(TestType))
    .then(() => context.frontendPlump.setTerminal(context.rest))
    .then(() => context.frontendPlump.addType(TestType))
    .then(() => {
      context.strut = new StrutServer(context.backendPlump, null, {
        apiProtocol: 'http',
        apiRoot: '/api',
        apiPort: TEST_PORT,
        authTypes: [],
      });
      return context.strut.initialize();
    })
    .then(() => context.strut.start())
    .then(() => console.log('Test server listening...'));
  });

  after(() => {
    // return server.stop(() => console.log('Test server stopped.'));
  });

  describe('attribute CRUD', () => {
    it('C', () => {
      const one = new TestType(sampleData, context.frontendPlump);
      return one.save()
      .then(saved => expect(saved).to.have.property('id', saved.id))
      .catch(err => {
        console.log(err);
        throw err;
      });
    });

    it('R', () => {
      const one = new TestType(sampleData, context.backendPlump);
      return one.save()
      .then(saved => {
        return context.backendPlump.find({ type: TestType.type, id: one.id }).get()
        .then(v => expect(v.attributes.name).to.equal(sampleData.name))
        .then((v) => context.frontendPlump.find({ type: TestType.type, id: one.id }).get())
        .then((v) => {
          expect(v.attributes.name).to.equal('potato');
          expect(v).to.have.property('id');
        });
      });
    });

    it('U', () => {
      const one = new TestType(sampleData, context.backendPlump);
      return one.save()
      .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id }).set({ name: 'frotato' }).save())
      .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id }).get())
      .then((v) => expect(v).to.have.nested.property('attributes.name', 'frotato'));
    });

    it('D', () => {
      const one = new TestType(sampleData, context.backendPlump);
      return one.save()
      .then((saved) => {
        return context.backendPlump.find({ type: TestType.type, id: one.id }).get()
        .then(v => expect(v.attributes.name).to.equal(sampleData.name))
        .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id }).get())
        .then((v) => expect(v).to.have.nested.property('attributes.name', 'potato'));
      })
      .then(() => one.delete())
      .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id }).get())
      .then((v) => expect(v).to.be.null);
    });
  });

  describe('relationship CRUD', () => {
    it('C', () => {
      const one = new TestType(sampleData, context.backendPlump);
      return one.save()
      .then(() => one.add('children', { id: 100 }).save())
      .then(() => one.get())
      .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id }).get(['attributes', 'relationships']))
      .then((v) => expect(v.relationships.children).to.deep.equal( [{ type: TestType.type, id: 100 }] ));
    });

    it('R', () => {
      const one = new TestType(sampleData, context.backendPlump);
      return one.save()
      .then(() => one.add('children', { id: 101 }).save())
      .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id }).get(['attributes', 'relationships']))
      .then((v) => {
        expect(v.attributes.name).to.equal(sampleData.name);
        expect(v.relationships.children).to.deep.equal([{ type: TestType.type, id: 101 }]);
      });
    });

    it('U', () => {
      const one = new TestType(sampleData, context.backendPlump);
      return one.save()
      .then(() => one.add('valenceChildren', { id: 102, meta: { perm: 2 } }).save())
      .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id }).get('relationships.valenceChildren'))
      .then((v) => expect(v.relationships.valenceChildren).to.deep.equal([{ type: TestType.type, id: 102, meta: { perm: 2 } }]))
      .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id } )
        .modifyRelationship('valenceChildren', { id: 102, meta: { perm: 3 } }).save())
      .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id }).get('relationships.valenceChildren'))
      .then((v) => expect(v.relationships.valenceChildren).to.deep.equal([{ type: TestType.type, id: 102, meta: { perm: 3 } }]));
    });

    it('D', () => {
      const one = new TestType(sampleData, context.backendPlump);
      return one.save()
      .then(() => one.add('children', { id: 103 }).save())
      .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id }).get('relationships'))
      .then((v) => expect(v.relationships.children).to.deep.equal([{ type: TestType.type, id: 103 }]))
      .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id }).remove('children', { id: 103 }).save())
      .then(() => context.frontendPlump.find({ type: TestType.type, id: one.id }).get('relationships'))
      .then((v) => expect(v.relationships.children).to.deep.equal([]));
    });
  });

  describe('socket functions', () => {
    it ('allows connection', () => {
      return new Promise((done) => {
        const io = SocketIO(`http://localhost:${TEST_PORT}`);
        io.on('connect', () => {
          done();
        });
      });
    });
    it ('validates api keys', () => {
      return new Promise((resolve, reject) => {
        const io = SocketIO(`http://localhost:${TEST_PORT}`);
        io.on('connect', () => {
          io.once('list', (v) => {
            expect(v.response).to.equal('list');
            resolve();
          });
        });
      });
    });
  });
});
