'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var _rest = require('../rest');

var _plump = require('plump');

var _axiosMocking = require('./axiosMocking');

var _axiosMocking2 = _interopRequireDefault(_axiosMocking);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.use(_chaiAsPromised2.default); /* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

var expect = _chai2.default.expect;

(0, _plump.testSuite)({
  describe: describe, it: it, before: before, after: after
}, {
  ctor: _rest.RestStore,
  opts: {
    terminal: true,
    axios: _axiosMocking2.default.mockup(_plump.TestType),
    schemata: _plump.TestType.toJSON()
  },
  name: 'Plump Rest Store'
});

describe('JSON API', function () {
  it('should flatten and return the top-level data from a rest response', function () {
    _plump.TestType.$include = {
      children: {
        attributes: ['name', 'extended'],
        relationships: ['children'],
        depth: Infinity
      }
    };

    var rest = new _rest.RestStore({
      terminal: true,
      axios: _axiosMocking2.default.mockup(_plump.TestType),
      schemata: _plump.TestType.toJSON()
    });
    var data = {
      id: 1,
      name: 'potato',
      extended: {}
    };

    return rest.write(_plump.TestType, Object.assign({}, data, { type: _plump.TestType.$name })).then(function () {
      return rest.read(_plump.TestType, 1);
    }).then(function (result) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvcmVzdC5zcGVjLmpzIl0sIm5hbWVzIjpbInVzZSIsImV4cGVjdCIsImRlc2NyaWJlIiwiaXQiLCJiZWZvcmUiLCJhZnRlciIsImN0b3IiLCJvcHRzIiwidGVybWluYWwiLCJheGlvcyIsIm1vY2t1cCIsInNjaGVtYXRhIiwidG9KU09OIiwibmFtZSIsIiRpbmNsdWRlIiwiY2hpbGRyZW4iLCJhdHRyaWJ1dGVzIiwicmVsYXRpb25zaGlwcyIsImRlcHRoIiwiSW5maW5pdHkiLCJyZXN0IiwiZGF0YSIsImlkIiwiZXh0ZW5kZWQiLCJ3cml0ZSIsIk9iamVjdCIsImFzc2lnbiIsInR5cGUiLCIkbmFtZSIsInRoZW4iLCJyZWFkIiwicmVzdWx0IiwidG8iLCJkZWVwIiwiZXF1YWwiXSwibWFwcGluZ3MiOiI7O0FBR0E7Ozs7QUFDQTs7OztBQUVBOztBQUNBOztBQUNBOzs7Ozs7QUFFQSxlQUFLQSxHQUFMLDJCLENBVkE7QUFDQTs7QUFVQSxJQUFNQyxTQUFTLGVBQUtBLE1BQXBCOztBQUVBLHNCQUFVO0FBQ1JDLG9CQURRLEVBQ0VDLE1BREYsRUFDTUMsY0FETixFQUNjQztBQURkLENBQVYsRUFFRztBQUNEQyx1QkFEQztBQUVEQyxRQUFNO0FBQ0pDLGNBQVUsSUFETjtBQUVKQyxXQUFPLHVCQUFVQyxNQUFWLGlCQUZIO0FBR0pDLGNBQVUsZ0JBQVNDLE1BQVQ7QUFITixHQUZMO0FBT0RDLFFBQU07QUFQTCxDQUZIOztBQVlBWCxTQUFTLFVBQVQsRUFBcUIsWUFBTTtBQUN6QkMsS0FBRyxtRUFBSCxFQUF3RSxZQUFNO0FBQzVFLG9CQUFTVyxRQUFULEdBQW9CO0FBQ2xCQyxnQkFBVTtBQUNSQyxvQkFBWSxDQUFDLE1BQUQsRUFBUyxVQUFULENBREo7QUFFUkMsdUJBQWUsQ0FBQyxVQUFELENBRlA7QUFHUkMsZUFBT0M7QUFIQztBQURRLEtBQXBCOztBQVFBLFFBQU1DLE9BQU8sb0JBQWM7QUFDekJaLGdCQUFVLElBRGU7QUFFekJDLGFBQU8sdUJBQVVDLE1BQVYsaUJBRmtCO0FBR3pCQyxnQkFBVSxnQkFBU0MsTUFBVDtBQUhlLEtBQWQsQ0FBYjtBQUtBLFFBQU1TLE9BQU87QUFDWEMsVUFBSSxDQURPO0FBRVhULFlBQU0sUUFGSztBQUdYVSxnQkFBVTtBQUhDLEtBQWI7O0FBTUEsV0FBT0gsS0FBS0ksS0FBTCxrQkFBcUJDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCTCxJQUFsQixFQUF3QixFQUFFTSxNQUFNLGdCQUFTQyxLQUFqQixFQUF4QixDQUFyQixFQUNOQyxJQURNLENBQ0QsWUFBTTtBQUNWLGFBQU9ULEtBQUtVLElBQUwsa0JBQW9CLENBQXBCLENBQVA7QUFDRCxLQUhNLEVBR0pELElBSEksQ0FHQyxrQkFBVTtBQUNoQixhQUFPNUIsT0FBTzhCLE1BQVAsRUFBZUMsRUFBZixDQUFrQkMsSUFBbEIsQ0FBdUJDLEtBQXZCLENBQTZCYixJQUE3QixDQUFQO0FBQ0QsS0FMTSxDQUFQO0FBTUQsR0ExQkQ7O0FBNEJBbEIsS0FBRyw4Q0FBSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRCxDQWpFRCIsImZpbGUiOiJ0ZXN0L3Jlc3Quc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1lbnYgbm9kZSwgbW9jaGEqL1xuLyogZXNsaW50IG5vLXNoYWRvdzogMCAqL1xuXG5pbXBvcnQgY2hhaSBmcm9tICdjaGFpJztcbmltcG9ydCBjaGFpQXNQcm9taXNlZCBmcm9tICdjaGFpLWFzLXByb21pc2VkJztcblxuaW1wb3J0IHsgUmVzdFN0b3JlIH0gZnJvbSAnLi4vcmVzdCc7XG5pbXBvcnQgeyB0ZXN0U3VpdGUsIFRlc3RUeXBlIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0IGF4aW9zTW9jayBmcm9tICcuL2F4aW9zTW9ja2luZyc7XG5cbmNoYWkudXNlKGNoYWlBc1Byb21pc2VkKTtcbmNvbnN0IGV4cGVjdCA9IGNoYWkuZXhwZWN0O1xuXG50ZXN0U3VpdGUoe1xuICBkZXNjcmliZSwgaXQsIGJlZm9yZSwgYWZ0ZXIsXG59LCB7XG4gIGN0b3I6IFJlc3RTdG9yZSxcbiAgb3B0czoge1xuICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgIGF4aW9zOiBheGlvc01vY2subW9ja3VwKFRlc3RUeXBlKSxcbiAgICBzY2hlbWF0YTogVGVzdFR5cGUudG9KU09OKCksXG4gIH0sXG4gIG5hbWU6ICdQbHVtcCBSZXN0IFN0b3JlJyxcbn0pO1xuXG5kZXNjcmliZSgnSlNPTiBBUEknLCAoKSA9PiB7XG4gIGl0KCdzaG91bGQgZmxhdHRlbiBhbmQgcmV0dXJuIHRoZSB0b3AtbGV2ZWwgZGF0YSBmcm9tIGEgcmVzdCByZXNwb25zZScsICgpID0+IHtcbiAgICBUZXN0VHlwZS4kaW5jbHVkZSA9IHtcbiAgICAgIGNoaWxkcmVuOiB7XG4gICAgICAgIGF0dHJpYnV0ZXM6IFsnbmFtZScsICdleHRlbmRlZCddLFxuICAgICAgICByZWxhdGlvbnNoaXBzOiBbJ2NoaWxkcmVuJ10sXG4gICAgICAgIGRlcHRoOiBJbmZpbml0eSxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3QgPSBuZXcgUmVzdFN0b3JlKHtcbiAgICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgICAgYXhpb3M6IGF4aW9zTW9jay5tb2NrdXAoVGVzdFR5cGUpLFxuICAgICAgc2NoZW1hdGE6IFRlc3RUeXBlLnRvSlNPTigpLFxuICAgIH0pO1xuICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICBpZDogMSxcbiAgICAgIG5hbWU6ICdwb3RhdG8nLFxuICAgICAgZXh0ZW5kZWQ6IHt9LFxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdC53cml0ZShUZXN0VHlwZSwgT2JqZWN0LmFzc2lnbih7fSwgZGF0YSwgeyB0eXBlOiBUZXN0VHlwZS4kbmFtZSB9KSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gcmVzdC5yZWFkKFRlc3RUeXBlLCAxKTtcbiAgICB9KS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICByZXR1cm4gZXhwZWN0KHJlc3VsdCkudG8uZGVlcC5lcXVhbChkYXRhKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjYWNoZSBhbGwgaW5jbHVkZWQgZGF0YSBmcm9tIHJlc3BvbnNlJyk7XG4gIC8vICwgKCkgPT4ge1xuICAvLyAgIGNvbnN0IHJlc3QgPSBuZXcgUmVzdFN0b3JlKHtcbiAgLy8gICAgIHRlcm1pbmFsOiB0cnVlLFxuICAvLyAgICAgYXhpb3M6IGF4aW9zTW9jay5tb2NrdXAoVGVzdFR5cGUpLFxuICAvLyAgIH0pO1xuICAvLyAgIGNvbnN0IG9uZSA9IHtcbiAgLy8gICAgIHR5cGU6IFRlc3RUeXBlLiRuYW1lLFxuICAvLyAgICAgaWQ6IDEsXG4gIC8vICAgICBuYW1lOiAncG90YXRvJyxcbiAgLy8gICAgIGV4dGVuZGVkOiB7fSxcbiAgLy8gICAgIGNoaWxkcmVuOiBbeyBwYXJlbnRfaWQ6IDEsIGNoaWxkX2lkOiAyIH1dLFxuICAvLyAgIH07XG4gIC8vICAgY29uc3QgdHdvID0ge1xuICAvLyAgICAgdHlwZTogVGVzdFR5cGUuJG5hbWUsXG4gIC8vICAgICBpZDogMixcbiAgLy8gICAgIG5hbWU6ICdmcm90YXRvJyxcbiAgLy8gICAgIGV4dGVuZGVkOiB7IGV4dGVuc2lvbjogJ3llcycgfSxcbiAgLy8gICAgIGNoaWxkcmVuOiBbeyBwYXJlbnRfaWQ6IDIsIGNoaWxkX2lkOiAzIH1dLFxuICAvLyAgIH07XG4gIC8vICAgY29uc3QgdGhyZWUgPSB7XG4gIC8vICAgICB0eXBlOiBUZXN0VHlwZS4kbmFtZSxcbiAgLy8gICAgIGlkOiAzLFxuICAvLyAgICAgbmFtZTogJ3J1dGFiYWdhJyxcbiAgLy8gICAgIGV4dGVuZGVkOiB7fSxcbiAgLy8gICB9O1xuICAvLyAgIHJldHVybiBCbHVlYmlyZC5hbGwoW1xuICAvLyAgICAgcmVzdC53cml0ZShUZXN0VHlwZSwgb25lKSxcbiAgLy8gICAgIHJlc3Qud3JpdGUoVGVzdFR5cGUsIHR3byksXG4gIC8vICAgICByZXN0LndyaXRlKFRlc3RUeXBlLCB0aHJlZSksXG4gIC8vICAgXSkudGhlbigoKSA9PiB7XG4gIC8vICAgICByZXR1cm4gcmVzdC5yZXN0KFRlc3RUeXBlLCAxKTtcbiAgLy8gICB9KS50aGVuKCgpID0+IHtcbiAgLy9cbiAgLy8gICB9KTtcbiAgLy8gfSk7XG59KTtcbiJdfQ==
