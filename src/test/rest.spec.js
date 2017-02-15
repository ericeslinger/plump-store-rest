/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { RestStore } from '../rest';
import { testSuite, TestType } from 'plump';
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

  it('should cache all included data from response');
  // , () => {
  //   const rest = new RestStore({
  //     terminal: true,
  //     axios: axiosMock.mockup(TestType),
  //   });
  //   const one = {
  //     type: TestType.$name,
  //     id: 1,
  //     name: 'potato',
  //     extended: {},
  //     children: [{ parent_id: 1, child_id: 2 }],
  //   };
  //   const two = {
  //     type: TestType.$name,
  //     id: 2,
  //     name: 'frotato',
  //     extended: { extension: 'yes' },
  //     children: [{ parent_id: 2, child_id: 3 }],
  //   };
  //   const three = {
  //     type: TestType.$name,
  //     id: 3,
  //     name: 'rutabaga',
  //     extended: {},
  //   };
  //   return Bluebird.all([
  //     rest.write(TestType, one),
  //     rest.write(TestType, two),
  //     rest.write(TestType, three),
  //   ]).then(() => {
  //     return rest.rest(TestType, 1);
  //   }).then(() => {
  //
  //   });
  // });
});
