/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { RestStore } from '../rest';
import { testSuite, TestType } from 'plump';
import axiosMock from './axiosMocking';

testSuite({
  describe, it, before, after,
}, {
  ctor: RestStore,
  opts: {
    terminal: true,
    axios: axiosMock.mockup(TestType),
  },
  name: 'Plump Rest Store',
});
