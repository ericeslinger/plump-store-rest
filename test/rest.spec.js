/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { RestStore } from '../src/index';
import { TestType } from 'plump/test/testType';
import { testSuite } from 'plump/test/storageTests';
import { MockAxios } from './axiosMocking';

testSuite({
  describe, it, before, after,
}, {
  ctor: RestStore,
  opts: {
    terminal: true,
    axios: new MockAxios(TestType).mockedAxios,
  },
  name: 'Plump Rest Store',
});
