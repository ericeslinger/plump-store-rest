'use strict';

var _rest = require('../rest');

var _plump = require('plump');

var _axiosMocking = require('./axiosMocking');

var _axiosMocking2 = _interopRequireDefault(_axiosMocking);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _plump.testSuite)({
  describe: describe, it: it, before: before, after: after
}, {
  ctor: _rest.RestStore,
  opts: {
    terminal: true,
    axios: _axiosMocking2.default.mockup(_plump.TestType)
  },
  name: 'Plump Rest Store'
}); /* eslint-env node, mocha*/
/* eslint no-shadow: 0 */
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvcmVzdC5zcGVjLmpzIl0sIm5hbWVzIjpbImRlc2NyaWJlIiwiaXQiLCJiZWZvcmUiLCJhZnRlciIsImN0b3IiLCJvcHRzIiwidGVybWluYWwiLCJheGlvcyIsIm1vY2t1cCIsIm5hbWUiXSwibWFwcGluZ3MiOiI7O0FBR0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLHNCQUFVO0FBQ1JBLG9CQURRLEVBQ0VDLE1BREYsRUFDTUMsY0FETixFQUNjQztBQURkLENBQVYsRUFFRztBQUNEQyx1QkFEQztBQUVEQyxRQUFNO0FBQ0pDLGNBQVUsSUFETjtBQUVKQyxXQUFPLHVCQUFVQyxNQUFWO0FBRkgsR0FGTDtBQU1EQyxRQUFNO0FBTkwsQ0FGSCxFLENBUEE7QUFDQSIsImZpbGUiOiJ0ZXN0L3Jlc3Quc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1lbnYgbm9kZSwgbW9jaGEqL1xuLyogZXNsaW50IG5vLXNoYWRvdzogMCAqL1xuXG5pbXBvcnQgeyBSZXN0U3RvcmUgfSBmcm9tICcuLi9yZXN0JztcbmltcG9ydCB7IHRlc3RTdWl0ZSwgVGVzdFR5cGUgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQgYXhpb3NNb2NrIGZyb20gJy4vYXhpb3NNb2NraW5nJztcblxudGVzdFN1aXRlKHtcbiAgZGVzY3JpYmUsIGl0LCBiZWZvcmUsIGFmdGVyLFxufSwge1xuICBjdG9yOiBSZXN0U3RvcmUsXG4gIG9wdHM6IHtcbiAgICB0ZXJtaW5hbDogdHJ1ZSxcbiAgICBheGlvczogYXhpb3NNb2NrLm1vY2t1cChUZXN0VHlwZSksXG4gIH0sXG4gIG5hbWU6ICdQbHVtcCBSZXN0IFN0b3JlJyxcbn0pO1xuIl19
