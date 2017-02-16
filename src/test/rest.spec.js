/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import * as Bluebird from 'bluebird';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { RestStore } from '../rest';
import { MemoryStore, Plump, testSuite, TestType } from 'plump';
import axiosMock from './axiosMocking';

chai.use(chaiAsPromised);
const expect = chai.expect;

testSuite({
  describe, it, before, after,
}, {
  ctor: RestStore,
  opts: {
    terminal: true,
    axios: axiosMock.mockup(TestType),
    schemata: TestType.toJSON(),
  },
  name: 'Plump Rest Store',
});

describe('JSON API', () => {
  it('should flatten and return the top-level data from a rest response', () => {
    TestType.$include = {
      children: {
        attributes: ['name', 'extended'],
        relationships: ['children'],
        depth: Infinity,
      },
    };

    const rest = new RestStore({
      terminal: true,
      axios: axiosMock.mockup(TestType),
      schemata: TestType.toJSON(),
    });
    const data = {
      id: 1,
      name: 'potato',
      extended: {},
    };

    return rest.write(TestType, Object.assign({}, data, { type: TestType.$name }))
    .then(() => {
      return rest.read(TestType, 1);
    }).then(result => {
      return expect(result).to.deep.equal(data);
    });
  });

  it('should cache all included data from response', () => {
    let cache;
    let plump;
    TestType.$include = {
      children: {
        attributes: ['name', 'extended'],
        relationships: ['children'],
        depth: Infinity,
      },
    };
    const one = {
      type: TestType.$name,
      id: 1,
      name: 'potato',
      extended: {},
      children: [{ id: 2 }],
    };
    const two = {
      type: TestType.$name,
      id: 2,
      name: 'frotato',
      extended: {},
    };

    const rest = new RestStore({
      terminal: true,
      axios: axiosMock.mockup(TestType),
      schemata: TestType.toJSON(),
    });

    return Bluebird.all([
      rest.write(TestType, one),
      rest.write(TestType, two),
    ]).then(() => {
      return Bluebird.all([
        expect(rest.read(TestType, one.id)).to.eventually.have.property('name', one.name),
        expect(rest.read(TestType, two.id)).to.eventually.have.property('name', two.name),
      ]);
    }).then(() => {
      cache = new MemoryStore();
      plump = new Plump({ storage: [rest, cache], types: [TestType] });
      return Bluebird.all([
        expect(cache.read(TestType, one.id)).to.eventually.be.null,
        expect(cache.read(TestType, two.id)).to.eventually.be.null,
      ]);
    }).then(() => {
      return rest.read(TestType, one.id);
    }).then(() => {
      return expect(cache.read(TestType, two.id)).to.eventually.have.property('name', two.name);
    }).finally(() => {
      if (plump) {
        plump.teardown();
      }
    });
  });
});
