'use strict';

var _bluebird = require('bluebird');

var Bluebird = _interopRequireWildcard(_bluebird);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var _rest = require('../rest');

var _plump = require('plump');

var _axiosMocking = require('./axiosMocking');

var _axiosMocking2 = _interopRequireDefault(_axiosMocking);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

_chai2.default.use(_chaiAsPromised2.default);
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

  it('should cache all included data from response', function () {
    var cache = void 0;
    var plump = void 0;
    _plump.TestType.$include = {
      children: {
        attributes: ['name', 'extended'],
        relationships: ['children'],
        depth: Infinity
      }
    };
    var one = {
      type: _plump.TestType.$name,
      id: 1,
      name: 'potato',
      extended: {},
      children: [{ id: 2 }]
    };
    var two = {
      type: _plump.TestType.$name,
      id: 2,
      name: 'frotato',
      extended: {}
    };

    var rest = new _rest.RestStore({
      terminal: true,
      axios: _axiosMocking2.default.mockup(_plump.TestType),
      schemata: _plump.TestType.toJSON()
    });

    return Bluebird.all([rest.write(_plump.TestType, one), rest.write(_plump.TestType, two)]).then(function () {
      return Bluebird.all([expect(rest.read(_plump.TestType, one.id)).to.eventually.have.property('name', one.name), expect(rest.read(_plump.TestType, two.id)).to.eventually.have.property('name', two.name)]);
    }).then(function () {
      cache = new _plump.MemoryStore();
      plump = new _plump.Plump({ storage: [rest, cache], types: [_plump.TestType] });
      return Bluebird.all([expect(cache.read(_plump.TestType, one.id)).to.eventually.be.null, expect(cache.read(_plump.TestType, two.id)).to.eventually.be.null]);
    }).then(function () {
      return rest.read(_plump.TestType, one.id);
    }).then(function () {
      return expect(cache.read(_plump.TestType, two.id)).to.eventually.have.property('name', two.name);
    }).finally(function () {
      if (plump) {
        plump.teardown();
      }
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvcmVzdC5zcGVjLmpzIl0sIm5hbWVzIjpbIkJsdWViaXJkIiwidXNlIiwiZXhwZWN0IiwiZGVzY3JpYmUiLCJpdCIsImJlZm9yZSIsImFmdGVyIiwiY3RvciIsIm9wdHMiLCJ0ZXJtaW5hbCIsImF4aW9zIiwibW9ja3VwIiwic2NoZW1hdGEiLCJ0b0pTT04iLCJuYW1lIiwiJGluY2x1ZGUiLCJjaGlsZHJlbiIsImF0dHJpYnV0ZXMiLCJyZWxhdGlvbnNoaXBzIiwiZGVwdGgiLCJJbmZpbml0eSIsInJlc3QiLCJkYXRhIiwiaWQiLCJleHRlbmRlZCIsIndyaXRlIiwiT2JqZWN0IiwiYXNzaWduIiwidHlwZSIsIiRuYW1lIiwidGhlbiIsInJlYWQiLCJyZXN1bHQiLCJ0byIsImRlZXAiLCJlcXVhbCIsImNhY2hlIiwicGx1bXAiLCJvbmUiLCJ0d28iLCJhbGwiLCJldmVudHVhbGx5IiwiaGF2ZSIsInByb3BlcnR5Iiwic3RvcmFnZSIsInR5cGVzIiwiYmUiLCJudWxsIiwiZmluYWxseSIsInRlYXJkb3duIl0sIm1hcHBpbmdzIjoiOztBQUdBOztJQUFZQSxROztBQUNaOzs7O0FBQ0E7Ozs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFUQTtBQUNBOztBQVVBLGVBQUtDLEdBQUw7QUFDQSxJQUFNQyxTQUFTLGVBQUtBLE1BQXBCOztBQUVBLHNCQUFVO0FBQ1JDLG9CQURRLEVBQ0VDLE1BREYsRUFDTUMsY0FETixFQUNjQztBQURkLENBQVYsRUFFRztBQUNEQyx1QkFEQztBQUVEQyxRQUFNO0FBQ0pDLGNBQVUsSUFETjtBQUVKQyxXQUFPLHVCQUFVQyxNQUFWLGlCQUZIO0FBR0pDLGNBQVUsZ0JBQVNDLE1BQVQ7QUFITixHQUZMO0FBT0RDLFFBQU07QUFQTCxDQUZIOztBQVlBWCxTQUFTLFVBQVQsRUFBcUIsWUFBTTtBQUN6QkMsS0FBRyxtRUFBSCxFQUF3RSxZQUFNO0FBQzVFLG9CQUFTVyxRQUFULEdBQW9CO0FBQ2xCQyxnQkFBVTtBQUNSQyxvQkFB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LENBQW1ESyxFQUFuRCxDQUFzREMsSUFEcEMsRUFFbEI3QyxPQUFPa0MsTUFBTUwsSUFBTixrQkFBcUJRLElBQUloQixFQUF6QixDQUFQLEVBQXFDVSxFQUFyQyxDQUF3Q1EsVUFBeEMsQ0FBbURLLEVBQW5ELENBQXNEQyxJQUZwQyxDQUFiLENBQVA7QUFJRCxLQWZNLEVBZUpqQixJQWZJLENBZUMsWUFBTTtBQUNaLGFBQU9ULEtBQUtVLElBQUwsa0JBQW9CTyxJQUFJZixFQUF4QixDQUFQO0FBQ0QsS0FqQk0sRUFpQkpPLElBakJJLENBaUJDLFlBQU07QUFDWixhQUFPNUIsT0FBT2tDLE1BQU1MLElBQU4sa0JBQXFCUSxJQUFJaEIsRUFBekIsQ0FBUCxFQUFxQ1UsRUFBckMsQ0FBd0NRLFVBQXhDLENBQW1EQyxJQUFuRCxDQUF3REMsUUFBeEQsQ0FBaUUsTUFBakUsRUFBeUVKLElBQUl6QixJQUE3RSxDQUFQO0FBQ0QsS0FuQk0sRUFtQkprQyxPQW5CSSxDQW1CSSxZQUFNO0FBQ2YsVUFBSVgsS0FBSixFQUFXO0FBQ1RBLGNBQU1ZLFFBQU47QUFDRDtBQUNGLEtBdkJNLENBQVA7QUF3QkQsR0F0REQ7QUF1REQsQ0FwRkQiLCJmaWxlIjoidGVzdC9yZXN0LnNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZW52IG5vZGUsIG1vY2hhKi9cbi8qIGVzbGludCBuby1zaGFkb3c6IDAgKi9cblxuaW1wb3J0ICogYXMgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IGNoYWkgZnJvbSAnY2hhaSc7XG5pbXBvcnQgY2hhaUFzUHJvbWlzZWQgZnJvbSAnY2hhaS1hcy1wcm9taXNlZCc7XG5cbmltcG9ydCB7IFJlc3RTdG9yZSB9IGZyb20gJy4uL3Jlc3QnO1xuaW1wb3J0IHsgTWVtb3J5U3RvcmUsIFBsdW1wLCB0ZXN0U3VpdGUsIFRlc3RUeXBlIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0IGF4aW9zTW9jayBmcm9tICcuL2F4aW9zTW9ja2luZyc7XG5cbmNoYWkudXNlKGNoYWlBc1Byb21pc2VkKTtcbmNvbnN0IGV4cGVjdCA9IGNoYWkuZXhwZWN0O1xuXG50ZXN0U3VpdGUoe1xuICBkZXNjcmliZSwgaXQsIGJlZm9yZSwgYWZ0ZXIsXG59LCB7XG4gIGN0b3I6IFJlc3RTdG9yZSxcbiAgb3B0czoge1xuICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgIGF4aW9zOiBheGlvc01vY2subW9ja3VwKFRlc3RUeXBlKSxcbiAgICBzY2hlbWF0YTogVGVzdFR5cGUudG9KU09OKCksXG4gIH0sXG4gIG5hbWU6ICdQbHVtcCBSZXN0IFN0b3JlJyxcbn0pO1xuXG5kZXNjcmliZSgnSlNPTiBBUEknLCAoKSA9PiB7XG4gIGl0KCdzaG91bGQgZmxhdHRlbiBhbmQgcmV0dXJuIHRoZSB0b3AtbGV2ZWwgZGF0YSBmcm9tIGEgcmVzdCByZXNwb25zZScsICgpID0+IHtcbiAgICBUZXN0VHlwZS4kaW5jbHVkZSA9IHtcbiAgICAgIGNoaWxkcmVuOiB7XG4gICAgICAgIGF0dHJpYnV0ZXM6IFsnbmFtZScsICdleHRlbmRlZCddLFxuICAgICAgICByZWxhdGlvbnNoaXBzOiBbJ2NoaWxkcmVuJ10sXG4gICAgICAgIGRlcHRoOiBJbmZpbml0eSxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3QgPSBuZXcgUmVzdFN0b3JlKHtcbiAgICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgICAgYXhpb3M6IGF4aW9zTW9jay5tb2NrdXAoVGVzdFR5cGUpLFxuICAgICAgc2NoZW1hdGE6IFRlc3RUeXBlLnRvSlNPTigpLFxuICAgIH0pO1xuICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICBpZDogMSxcbiAgICAgIG5hbWU6ICdwb3RhdG8nLFxuICAgICAgZXh0ZW5kZWQ6IHt9LFxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdC53cml0ZShUZXN0VHlwZSwgT2JqZWN0LmFzc2lnbih7fSwgZGF0YSwgeyB0eXBlOiBUZXN0VHlwZS4kbmFtZSB9KSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gcmVzdC5yZWFkKFRlc3RUeXBlLCAxKTtcbiAgICB9KS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICByZXR1cm4gZXhwZWN0KHJlc3VsdCkudG8uZGVlcC5lcXVhbChkYXRhKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjYWNoZSBhbGwgaW5jbHVkZWQgZGF0YSBmcm9tIHJlc3BvbnNlJywgKCkgPT4ge1xuICAgIGxldCBjYWNoZTtcbiAgICBsZXQgcGx1bXA7XG4gICAgVGVzdFR5cGUuJGluY2x1ZGUgPSB7XG4gICAgICBjaGlsZHJlbjoge1xuICAgICAgICBhdHRyaWJ1dGVzOiBbJ25hbWUnLCAnZXh0ZW5kZWQnXSxcbiAgICAgICAgcmVsYXRpb25zaGlwczogWydjaGlsZHJlbiddLFxuICAgICAgICBkZXB0aDogSW5maW5pdHksXG4gICAgICB9LFxuICAgIH07XG4gICAgY29uc3Qgb25lID0ge1xuICAgICAgdHlwZTogVGVzdFR5cGUuJG5hbWUsXG4gICAgICBpZDogMSxcbiAgICAgIG5hbWU6ICdwb3RhdG8nLFxuICAgICAgZXh0ZW5kZWQ6IHt9LFxuICAgICAgY2hpbGRyZW46IFt7IGlkOiAyIH1dLFxuICAgIH07XG4gICAgY29uc3QgdHdvID0ge1xuICAgICAgdHlwZTogVGVzdFR5cGUuJG5hbWUsXG4gICAgICBpZDogMixcbiAgICAgIG5hbWU6ICdmcm90YXRvJyxcbiAgICAgIGV4dGVuZGVkOiB7fSxcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdCA9IG5ldyBSZXN0U3RvcmUoe1xuICAgICAgdGVybWluYWw6IHRydWUsXG4gICAgICBheGlvczogYXhpb3NNb2NrLm1vY2t1cChUZXN0VHlwZSksXG4gICAgICBzY2hlbWF0YTogVGVzdFR5cGUudG9KU09OKCksXG4gICAgfSk7XG5cbiAgICByZXR1cm4gQmx1ZWJpcmQuYWxsKFtcbiAgICAgIHJlc3Qud3JpdGUoVGVzdFR5cGUsIG9uZSksXG4gICAgICByZXN0LndyaXRlKFRlc3RUeXBlLCB0d28pLFxuICAgIF0pLnRoZW4oKCkgPT4ge1xuICAgICAgcmV0dXJuIEJsdWViaXJkLmFsbChbXG4gICAgICAgIGV4cGVjdChyZXN0LnJlYWQoVGVzdFR5cGUsIG9uZS5pZCkpLnRvLmV2ZW50dWFsbHkuaGF2ZS5wcm9wZXJ0eSgnbmFtZScsIG9uZS5uYW1lKSxcbiAgICAgICAgZXhwZWN0KHJlc3QucmVhZChUZXN0VHlwZSwgdHdvLmlkKSkudG8uZXZlbnR1YWxseS5oYXZlLnByb3BlcnR5KCduYW1lJywgdHdvLm5hbWUpLFxuICAgICAgXSk7XG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICBjYWNoZSA9IG5ldyBNZW1vcnlTdG9yZSgpO1xuICAgICAgcGx1bXAgPSBuZXcgUGx1bXAoeyBzdG9yYWdlOiBbcmVzdCwgY2FjaGVdLCB0eXBlczogW1Rlc3RUeXBlXSB9KTtcbiAgICAgIHJldHVybiBCbHVlYmlyZC5hbGwoW1xuICAgICAgICBleHBlY3QoY2FjaGUucmVhZChUZXN0VHlwZSwgb25lLmlkKSkudG8uZXZlbnR1YWxseS5iZS5udWxsLFxuICAgICAgICBleHBlY3QoY2FjaGUucmVhZChUZXN0VHlwZSwgdHdvLmlkKSkudG8uZXZlbnR1YWxseS5iZS5udWxsLFxuICAgICAgXSk7XG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gcmVzdC5yZWFkKFRlc3RUeXBlLCBvbmUuaWQpO1xuICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgcmV0dXJuIGV4cGVjdChjYWNoZS5yZWFkKFRlc3RUeXBlLCB0d28uaWQpKS50by5ldmVudHVhbGx5LmhhdmUucHJvcGVydHkoJ25hbWUnLCB0d28ubmFtZSk7XG4gICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICBpZiAocGx1bXApIHtcbiAgICAgICAgcGx1bXAudGVhcmRvd24oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==
