'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _plump = require('plump');

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _plumpJsonApi = require('plump-json-api');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var backingStore = new _plump.MemoryStore({ terminal: true });

function mockup(t) {
  var api = new _plumpJsonApi.JSONApi({ schemata: t.toJSON() });
  var mockedAxios = axios.create({ baseURL: '' });
  mockedAxios.defaults.adapter = function (config) {
    var apiWrap = true; // should we wrap in standard JSON API at the bottom
    return _bluebird2.default.resolve().then(function () {
      var matchBase = config.url.match(new RegExp('^/' + t.$name + '$'));
      var matchItem = config.url.match(new RegExp('^/' + t.$name + '/(\\d+)$'));
      var matchSideBase = config.url.match(new RegExp('^/' + t.$name + '/(\\d+)/(\\w+)$'));
      var matchSideItem = config.url.match(new RegExp('^/' + t.$name + '/(\\d+)/(\\w+)/(\\d+)$'));

      if (config.method === 'get') {
        if (matchBase) {
          return _bluebird2.default.all([backingStore.query(), _bluebird2.default.resolve([])]);
        } else if (matchItem) {
          return _bluebird2.default.all([backingStore.read(t, parseInt(matchItem[1], 10)), _bluebird2.default.resolve([{
            type: t.$name,
            id: 2,
            name: 'frotato',
            extended: {}
          }])]);
        } else if (matchSideBase) {
          apiWrap = false;
          return _bluebird2.default.all([backingStore.read(t, parseInt(matchSideBase[1], 10), matchSideBase[2]), _bluebird2.default.resolve([])]);
        }
      } else if (config.method === 'post') {
        if (matchBase) {
          return _bluebird2.default.all([backingStore.write(t, JSON.parse(config.data)), _bluebird2.default.resolve([])]);
        }
      } else if (config.method === 'patch') {
        if (matchItem) {
          return _bluebird2.default.all([backingStore.write(t, Object.assign({}, JSON.parse(config.data), _defineProperty({}, t.$id, parseInt(matchItem[1], 10)))), _bluebird2.default.resolve([])]);
        } else if (matchSideItem) {
          return _bluebird2.default.all([backingStore.modifyRelationship(t, parseInt(matchSideItem[1], 10), matchSideItem[2], parseInt(matchSideItem[3], 10), JSON.parse(config.data)), _bluebird2.default.resolve([])]);
        }
      } else if (config.method === 'put') {
        if (matchSideBase) {
          apiWrap = false;
          var relationshipBlock = t.$fields[matchSideBase[2]];
          var sideInfo = relationshipBlock.relationship.$sides[matchSideBase[2]];
          return _bluebird2.default.all([backingStore.add(t, parseInt(matchSideBase[1], 10), matchSideBase[2], JSON.parse(config.data)[sideInfo.other.field], JSON.parse(config.data)), _bluebird2.default.resolve([])]);
        }
      } else if (config.method === 'delete') {
        if (matchItem) {
          return _bluebird2.default.all([backingStore.delete(t, parseInt(matchItem[1], 10)), _bluebird2.default.resolve([])]);
        } else if (matchSideItem) {
          apiWrap = false;
          return _bluebird2.default.all([backingStore.remove(t, parseInt(matchSideItem[1], 10), matchSideItem[2], parseInt(matchSideItem[3], 10)), _bluebird2.default.resolve([])]);
        }
      }
      return _bluebird2.default.reject({ response: { status: 400 } });
    }).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          data = _ref2[0],
          extended = _ref2[1];

      // console.log('FOR');
      // console.log(config);
      // console.log(`RESOLVING ${JSON.stringify(d)}`);
      if (data) {
        if (apiWrap) {
          var root = Object.assign({}, data, { type: t.$name });
          return {
            data: api.encode({ root: root, extended: extended })
          };
        } else {
          return {
            data: data
          };
        }
      } else {
        return _bluebird2.default.reject({ response: { status: 404 } });
      }
    });
  };
  return mockedAxios;
}

var axiosMock = {
  mockup: mockup
};

exports.default = axiosMock;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvYXhpb3NNb2NraW5nLmpzIl0sIm5hbWVzIjpbImF4aW9zIiwiYmFja2luZ1N0b3JlIiwidGVybWluYWwiLCJtb2NrdXAiLCJ0IiwiYXBpIiwic2NoZW1hdGEiLCJ0b0pTT04iLCJtb2NrZWRBeGlvcyIsImNyZWF0ZSIsImJhc2VVUkwiLCJkZWZhdWx0cyIsImFkYXB0ZXIiLCJjb25maWciLCJhcGlXcmFwIiwicmVzb2x2ZSIsInRoZW4iLCJtYXRjaEJhc2UiLCJ1cmwiLCJtYXRjaCIsIlJlZ0V4cCIsIiRuYW1lIiwibWF0Y2hJdGVtIiwibWF0Y2hTaWRlQmFzZSIsIm1hdGNoU2lkZUl0ZW0iLCJtZXRob2QiLCJhbGwiLCJxdWVyeSIsInJlYWQiLCJwYXJzZUludCIsInR5cGUiLCJpZCIsIm5hbWUiLCJleHRlbmRlZCIsIndyaXRlIiwiSlNPTiIsInBhcnNlIiwiZGF0YSIsIk9iamVjdCIsImFzc2lnbiIsIiRpZCIsIm1vZGlmeVJlbGF0aW9uc2hpcCIsInJlbGF0aW9uc2hpcEJsb2NrIiwiJGZpZWxkcyIsInNpZGVJbmZvIiwicmVsYXRpb25zaGlwIiwiJHNpZGVzIiwiYWRkIiwib3RoZXIiLCJmaWVsZCIsImRlbGV0ZSIsInJlbW92ZSIsInJlamVjdCIsInJlc3BvbnNlIiwic3RhdHVzIiwicm9vdCIsImVuY29kZSIsImF4aW9zTW9jayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU1DLGVBQWUsdUJBQWdCLEVBQUVDLFVBQVUsSUFBWixFQUFoQixDQUFyQjs7QUFFQSxTQUFTQyxNQUFULENBQWdCQyxDQUFoQixFQUFtQjtBQUNqQixNQUFNQyxNQUFNLDBCQUFZLEVBQUVDLFVBQVVGLEVBQUVHLE1BQUYsRUFBWixFQUFaLENBQVo7QUFDQSxNQUFNQyxjQUFjUixNQUFNUyxNQUFOLENBQWEsRUFBRUMsU0FBUyxFQUFYLEVBQWIsQ0FBcEI7QUFDQUYsY0FBWUcsUUFB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LENBQVA7QUF5SEQsR0EzSEQ7QUE0SEEsU0FBTzlDLFdBQVA7QUFDRDs7QUFFRCxJQUFNaUQsWUFBWTtBQUNoQnREO0FBRGdCLENBQWxCOztrQkFJZXNELFMiLCJmaWxlIjoidGVzdC9heGlvc01vY2tpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZW1vcnlTdG9yZSB9IGZyb20gJ3BsdW1wJztcbmltcG9ydCAqIGFzIGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7IEpTT05BcGkgfSBmcm9tICdwbHVtcC1qc29uLWFwaSc7XG5cbmNvbnN0IGJhY2tpbmdTdG9yZSA9IG5ldyBNZW1vcnlTdG9yZSh7IHRlcm1pbmFsOiB0cnVlIH0pO1xuXG5mdW5jdGlvbiBtb2NrdXAodCkge1xuICBjb25zdCBhcGkgPSBuZXcgSlNPTkFwaSh7IHNjaGVtYXRhOiB0LnRvSlNPTigpIH0pO1xuICBjb25zdCBtb2NrZWRBeGlvcyA9IGF4aW9zLmNyZWF0ZSh7IGJhc2VVUkw6ICcnIH0pO1xuICBtb2NrZWRBeGlvcy5kZWZhdWx0cy5hZGFwdGVyID0gKGNvbmZpZykgPT4ge1xuICAgIGxldCBhcGlXcmFwID0gdHJ1ZTsgLy8gc2hvdWxkIHdlIHdyYXAgaW4gc3RhbmRhcmQgSlNPTiBBUEkgYXQgdGhlIGJvdHRvbVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgIGNvbnN0IG1hdGNoQmFzZSA9IGNvbmZpZy51cmwubWF0Y2gobmV3IFJlZ0V4cChgXi8ke3QuJG5hbWV9JGApKTtcbiAgICAgIGNvbnN0IG1hdGNoSXRlbSA9IGNvbmZpZy51cmwubWF0Y2gobmV3IFJlZ0V4cChgXi8ke3QuJG5hbWV9LyhcXFxcZCspJGApKTtcbiAgICAgIGNvbnN0IG1hdGNoU2lkZUJhc2UgPSBjb25maWcudXJsLm1hdGNoKG5ldyBSZWdFeHAoYF4vJHt0LiRuYW1lfS8oXFxcXGQrKS8oXFxcXHcrKSRgKSk7XG4gICAgICBjb25zdCBtYXRjaFNpZGVJdGVtID0gY29uZmlnLnVybC5tYXRjaChuZXcgUmVnRXhwKGBeLyR7dC4kbmFtZX0vKFxcXFxkKykvKFxcXFx3KykvKFxcXFxkKykkYCkpO1xuXG5cbiAgICAgIGlmIChjb25maWcubWV0aG9kID09PSAnZ2V0Jykge1xuICAgICAgICBpZiAobWF0Y2hCYXNlKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGJhY2tpbmdTdG9yZS5xdWVyeSgpLFxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKFtdKSxcbiAgICAgICAgICBdKTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaEl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgYmFja2luZ1N0b3JlLnJlYWQodCwgcGFyc2VJbnQobWF0Y2hJdGVtWzFdLCAxMCkpLFxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKFt7XG4gICAgICAgICAgICAgIHR5cGU6IHQuJG5hbWUsXG4gICAgICAgICAgICAgIGlkOiAyLFxuICAgICAgICAgICAgICBuYW1lOiAnZnJvdGF0bycsXG4gICAgICAgICAgICAgIGV4dGVuZGVkOiB7fSxcbiAgICAgICAgICAgIH1dKSxcbiAgICAgICAgICBdKTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFNpZGVCYXNlKSB7XG4gICAgICAgICAgYXBpV3JhcCA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICBiYWNraW5nU3RvcmUucmVhZCh0LCBwYXJzZUludChtYXRjaFNpZGVCYXNlWzFdLCAxMCksIG1hdGNoU2lkZUJhc2VbMl0pLFxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKFtdKSxcbiAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChjb25maWcubWV0aG9kID09PSAncG9zdCcpIHtcbiAgICAgICAgaWYgKG1hdGNoQmFzZSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICBiYWNraW5nU3RvcmUud3JpdGUodCwgSlNPTi5wYXJzZShjb25maWcuZGF0YSkpLFxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKFtdKSxcbiAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChjb25maWcubWV0aG9kID09PSAncGF0Y2gnKSB7XG4gICAgICAgIGlmIChtYXRjaEl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgYmFja2luZ1N0b3JlLndyaXRlKFxuICAgICAgICAgICAgICB0LFxuICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoY29uZmlnLmRhdGEpLFxuICAgICAgICAgICAgICAgIHsgW3QuJGlkXTogcGFyc2VJbnQobWF0Y2hJdGVtWzFdLCAxMCkgfVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKFtdKSxcbiAgICAgICAgICBdKTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFNpZGVJdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGJhY2tpbmdTdG9yZS5tb2RpZnlSZWxhdGlvbnNoaXAoXG4gICAgICAgICAgICAgIHQsXG4gICAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoU2lkZUl0ZW1bMV0sIDEwKSxcbiAgICAgICAgICAgICAgbWF0Y2hTaWRlSXRlbVsyXSxcbiAgICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2hTaWRlSXRlbVszXSwgMTApLFxuICAgICAgICAgICAgICBKU09OLnBhcnNlKGNvbmZpZy5kYXRhKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZShbXSksXG4gICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY29uZmlnLm1ldGhvZCA9PT0gJ3B1dCcpIHtcbiAgICAgICAgaWYgKG1hdGNoU2lkZUJhc2UpIHtcbiAgICAgICAgICBhcGlXcmFwID0gZmFsc2U7XG4gICAgICAgICAgY29uc3QgcmVsYXRpb25zaGlwQmxvY2sgPSB0LiRmaWVsZHNbbWF0Y2hTaWRlQmFzZVsyXV07XG4gICAgICAgICAgY29uc3Qgc2lkZUluZm8gPSByZWxhdGlvbnNoaXBCbG9jay5yZWxhdGlvbnNoaXAuJHNpZGVzW21hdGNoU2lkZUJhc2VbMl1dO1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICBiYWNraW5nU3RvcmUuYWRkKFxuICAgICAgICAgICAgICB0LFxuICAgICAgICAgICAgICBwYXJzZUludChtYXRjaFNpZGVCYXNlWzFdLCAxMCksXG4gICAgICAgICAgICAgIG1hdGNoU2lkZUJhc2VbMl0sXG4gICAgICAgICAgICAgIEpTT04ucGFyc2UoY29uZmlnLmRhdGEpW3NpZGVJbmZvLm90aGVyLmZpZWxkXSxcbiAgICAgICAgICAgICAgSlNPTi5wYXJzZShjb25maWcuZGF0YSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoW10pLFxuICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGNvbmZpZy5tZXRob2QgPT09ICdkZWxldGUnKSB7XG4gICAgICAgIGlmIChtYXRjaEl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgYmFja2luZ1N0b3JlLmRlbGV0ZSh0LCBwYXJzZUludChtYXRjaEl0ZW1bMV0sIDEwKSksXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoW10pLFxuICAgICAgICAgIF0pO1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoU2lkZUl0ZW0pIHtcbiAgICAgICAgICBhcGlXcmFwID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGJhY2tpbmdTdG9yZS5yZW1vdmUoXG4gICAgICAgICAgICAgIHQsXG4gICAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoU2lkZUl0ZW1bMV0sIDEwKSxcbiAgICAgICAgICAgICAgbWF0Y2hTaWRlSXRlbVsyXSxcbiAgICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2hTaWRlSXRlbVszXSwgMTApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKFtdKSxcbiAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHsgcmVzcG9uc2U6IHsgc3RhdHVzOiA0MDAgfSB9KTtcbiAgICB9KS50aGVuKChbZGF0YSwgZXh0ZW5kZWRdKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZygnRk9SJyk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhjb25maWcpO1xuICAgICAgLy8gY29uc29sZS5sb2coYFJFU09MVklORyAke0pTT04uc3RyaW5naWZ5KGQpfWApO1xuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgaWYgKGFwaVdyYXApIHtcbiAgICAgICAgICBjb25zdCByb290ID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHsgdHlwZTogdC4kbmFtZSB9XG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogYXBpLmVuY29kZSh7IHJvb3QsIGV4dGVuZGVkIH0pLFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHsgcmVzcG9uc2U6IHsgc3RhdHVzOiA0MDQgfSB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIG1vY2tlZEF4aW9zO1xufVxuXG5jb25zdCBheGlvc01vY2sgPSB7XG4gIG1vY2t1cCxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGF4aW9zTW9jaztcbiJdfQ==
