/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { RestStore } from '../src/index';
import { TestType } from 'plump/test/testType';
import { testSuite } from 'plump/test/storageTests';
import axiosMock from './axiosMocking';

testSuite({
  describe, it, before, after,
}, {
  ctor: RestStore,
  opts: {
    terminal: true,
    axios: axiosMock.mockup(TestType),
    schemata: [TestType.toJSON()],
  },
  name: 'Plump Rest Store',
});
