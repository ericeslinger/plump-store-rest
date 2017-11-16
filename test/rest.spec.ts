import { RestStore } from '../src/index';
import { testSuite } from './storageTests';
import { mockedAxios, init } from './axiosMocking';
import { TestType } from './testType';

import { expect } from 'chai';

import 'mocha';

before(() => {
  return init();
});

testSuite(
  {
    describe,
    it,
    before,
    after,
  },
  {
    ctor: RestStore,
    opts: {
      terminal: true,
      axios: mockedAxios,
    },
    name: 'Plump Rest Store',
  },
);

describe('rest-specific behaviors', () => {
  let store: RestStore;
  before(() => {
    store = new RestStore({
      terminal: true,
      axios: mockedAxios,
    });
    return store.addSchema(TestType);
  });
  it('allows fancy views', () => {
    return store
      .read({
        item: { id: 999, type: 'tests' },
        view: 'fancy',
        fields: ['attributes'],
      })
      .then((v: any) => {
        expect(v.fancy).to.equal(true);
      });
  });
});
