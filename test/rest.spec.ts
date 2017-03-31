import { RestStore } from '../src/index';
import { testSuite } from './storageTests';
import { mockedAxios, init } from './axiosMocking';

import 'mocha';

before(() => {
  return init();
});

testSuite({
  describe, it, before, after,
}, {
  ctor: RestStore,
  opts: {
    terminal: true,
    axios: mockedAxios,
  },
  name: 'Plump Rest Store',
});
