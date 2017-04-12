/* eslint-env node, mocha */

import * as Hapi from 'hapi';
import * as pg from 'pg';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { Plump } from 'plump';
import { PGStore } from 'plump-store-postgres';
import { TestType } from './testType';
import { RestStore } from '../src/rest';
import { BaseController } from 'plump-strut';

import 'mocha';

// import { IPromise } from 'hapi';

declare module 'hapi' {
  interface Server {
    register(plugins: any | any[], options: {
        select?: string | string[];
        routes?: {
            prefix: string; vhost?: string | string[]
        };
    }, callback: (err: any) => void): void;
    register(plugins: any | any[], options: {
        select?: string | string[];
        routes?: {
            prefix: string; vhost?: string | string[]
        };
    }): Promise<any>;
  }
}


const TEST_PORT = parseInt(process.env.TEST_PORT, 10) || 4000;

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
      if (e1) throw e1; // tslint:disable-line curly
      client.query(command, (e2) => {
        if (e2) throw e2; // tslint:disable-line curly
        client.end((e3) => {
          if (e3) throw e3; // tslint:disable-line curly
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
  // typeName: 'tests',
  // attributes: {
    name: 'potato',
    extended: {
      actual: 'rutabaga',
      otherValue: 42,
    },
  // },
  // relationships: {},
};

describe('Plump Rest Integration', () => {
  const server = new Hapi.Server();

  server.connection({
    host: 'localhost',
    port: TEST_PORT,
  });

  const rest = new RestStore({
    baseURL: `http://localhost:${TEST_PORT}/api`,
    terminal: true,
  });
  const frontendPlump = new Plump();
  const backendPlump = new Plump();

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
      return backendPlump.setTerminal(terminal);
    })
    .then(() => backendPlump.addType(TestType))
    .then(() => frontendPlump.setTerminal(rest))
    .then(() => frontendPlump.addType(TestType))
    .then(() => server.register(new BaseController(backendPlump, TestType).plugin, { routes: { prefix: '/api/tests', } }))
    .then(() => server.start(() => console.log('Test server listening...')));
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
      return one.save()
      .then(saved => expect(saved).to.have.property('id', saved.id))
      .catch(err => {
        console.log(err);
        throw err;
      });
    });

    it('R', () => {
      const one = new TestType(sampleData, backendPlump);
      return one.save()
      .then(saved => {
        return backendPlump.find({ typeName: TestType.typeName, id: one.id }).get()
        .then(v => expect(v.attributes.name).to.equal(sampleData.name))
        .then((v) => frontendPlump.find({ typeName: TestType.typeName, id: one.id }).get())
        .then((v) => {
          expect(v.attributes.name).to.equal('potato');
          expect(v).to.have.property('id');
        });
      });
    });

    it('U', () => {
      const one = new TestType(sampleData, backendPlump);
      return one.save()
      .then(() => frontendPlump.find({ typeName: TestType.typeName, id: one.id }).set({ name: 'frotato' }).save())
      .then(() => frontendPlump.find({ typeName: TestType.typeName, id: one.id }).get())
      .then((v) => expect(v).to.have.deep.property('attributes.name', 'frotato'));
    });

    it('D', () => {
      const one = new TestType(sampleData, backendPlump);
      return one.save()
      .then((saved) => {
        return backendPlump.find({ typeName: TestType.typeName, id: one.id }).get()
        .then(v => expect(v.attributes.name).to.equal(sampleData.name))
        .then(() => frontendPlump.find({ typeName: TestType.typeName, id: one.id }).get())
        .then((v) => expect(v).to.have.deep.property('attributes.name', 'potato'));
      })
      .then(() => one.delete())
      .then(() => expect(frontendPlump.find({ typeName: TestType.typeName, id: one.id }).get()).to.eventually.be.null);
    });
  });

  describe('relationship CRUD', () => {
    it('C', () => {
      const one = new TestType(sampleData, backendPlump);
      return one.save()
      .then(() => one.add('children', { id: 100 }).save())
      .then(() => one.get())
      .then(() => frontendPlump.find({ typeName: TestType.typeName, id: one.id }).get(['attributes', 'relationships']))
      .then((v) => expect(v.relationships.children).to.deep.equal( [{ id: 100 }] ));
    });

    it('R', () => {
      const one = new TestType(sampleData, backendPlump);
      return one.save()
      .then(() => one.add('children', { id: 101 }).save())
      .then(() => frontendPlump.find({ typeName: TestType.typeName, id: one.id }).get(['attributes', 'relationships']))
      .then((v) => {
        expect(v.attributes.name).to.equal(sampleData.name);
        expect(v.relationships.children).to.deep.equal([{ id: 101 }]);
      });
    });

    it('U', () => {
      const one = new TestType(sampleData, backendPlump);
      return one.save()
      .then(() => one.add('valenceChildren', { id: 102, meta: { perm: 2 } }).save())
      .then(() => frontendPlump.find({ typeName: TestType.typeName, id: one.id }).get('relationships.valenceChildren'))
      .then((v) => expect(v.relationships.valenceChildren).to.deep.equal([{ id: 102, meta: { perm: 2 } }]))
      .then(() => frontendPlump.find({ typeName: TestType.typeName, id: one.id } )
        .modifyRelationship('valenceChildren', { id: 102, meta: { perm: 3 } }).save())
      .then(() => frontendPlump.find({ typeName: TestType.typeName, id: one.id }).get('relationships.valenceChildren'))
      .then((v) => expect(v.relationships.valenceChildren).to.deep.equal([{ id: 102, meta: { perm: 3 } }]));
    });

    it('D', () => {
      const one = new TestType(sampleData, backendPlump);
      return one.save()
      .then(() => one.add('children', { id: 103 }).save())
      .then(() => frontendPlump.find({ typeName: TestType.typeName, id: one.id }).get('relationships'))
      .then((v) => expect(v.relationships.children).to.deep.equal([{ id: 103 }]))
      .then(() => frontendPlump.find({ typeName: TestType.typeName, id: one.id }).remove('children', { id: 103 }).save())
      .then(() => frontendPlump.find({ typeName: TestType.typeName, id: one.id }).get('relationships'))
      .then((v) => expect(v.relationships.children).to.deep.equal([]));
    });
  });
});
