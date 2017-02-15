'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RestStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

var _plump = require('plump');

var _plumpJsonApi = require('plump-json-api');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var $axios = Symbol('$axios');
var $json = Symbol('$json');

var RestStore = exports.RestStore = function (_Storage) {
  _inherits(RestStore, _Storage);

  function RestStore() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RestStore);

    var _this = _possibleConstructorReturn(this, (RestStore.__proto__ || Object.getPrototypeOf(RestStore)).call(this, opts));

    var options = Object.assign({}, {
      baseURL: 'http://localhost/api',
      schemata: []
    }, opts);
    _this[$axios] = options.axios || axios.create(options);
    _this[$json] = new _plumpJsonApi.JSONApi({ schemata: options.schemata, baseURL: options.baseURL });
    return _this;
  }

  _createClass(RestStore, [{
    key: 'rest',
    value: function rest(options) {
      return this[$axios](options);
    }
  }, {
    key: 'write',
    value: function write(t, v) {
      var _this2 = this;

      return _bluebird2.default.resolve().then(function () {
        if (v[t.$id]) {
          return _this2[$axios].patch('/' + t.$name + '/' + v[t.$id], v);
        } else if (_this2.terminal) {
          return _this2[$axios].post('/' + t.$name, v);
        } else {
          throw new Error('Cannot create new content in a non-terminal store');
        }
      }).then(function (response) {
        var result = _this2[$json].parse(response.data);
        result.extended.forEach(function (item) {
          // item.type is currently just a string.
          // TODO: Figure out how to make it an actual Type
          // OR change how notifyUpdate works
          _this2.notifyUpdate(item.type, item.id, item, item.type.$include.concat(_plump.$self));
        });
        var root = {};
        for (var field in result.root) {
          if (field !== 'type') {
            root[field] = result.root[field];
          }
        }
        return root;
      }).then(function (result) {
        return _this2.notifyUpdate(t, result[t.$id], result).then(function () {
          return result;
        });
      });
    }
  }, {
    key: 'readOne',
    value: function readOne(t, id) {
      var _this3 = this;

      return _bluebird2.default.resolve().then(function () {
        return _this3[$axios].get('/' + t.$name + '/' + id);
      }).then(function (response) {
        var result = _this3[$json].parse(response.data);
        result.extended.forEach(function (item) {
          // item.type is currently just a string.
          // TODO: Figure out how to make it an actual Type
          // OR change how notifyUpdate works
          _this3.notifyUpdate(item.type, item.id, item, item.type.$include.concat(_plump.$self));
        });
        var root = {};
        for (var field in result.root) {
          if (field !== 'type') {
            root[field] = result.root[field];
          }
        }
        return root;
      }).catch(function (err) {
        if (err.response && err.response.status === 404) {
          return null;
        } else {
          throw err;
        }
      });
    }
  }, {
    key: 'readMany',
    value: function readMany(t, id, relationship) {
      return this[$axios].get('/' + t.$name + '/' + id + '/' + relationship).then(function (response) {
        return response.data;
      }).catch(function (err) {
        if (err.response && err.response.status === 404) {
          return [];
        } else {
          throw err;
        }
      });
    }
  }, {
    key: 'add',
    value: function add(type, id, relationshipTitle, childId, extras) {
      var _newField,
          _this4 = this;

      var relationshipBlock = type.$fields[relationshipTitle];
      var sideInfo = relationshipBlock.relationship.$sides[relationshipTitle];
      var newField = (_newField = {}, _defineProperty(_newField, sideInfo.self.field, id), _defineProperty(_newField, sideInfo.other.field, childId), _newField);
      if (relationshipBlock.relationship.$extras) {
        Object.keys(relationshipBlock.relationship.$extras).forEach(function (extra) {
          newField[extra] = extras[extra];
        });
      }
      return this[$axios].put('/' + type.$name + '/' + id + '/' + relationshipTitle, newField).then(function () {
        return _this4.notifyUpdate(type, id, null, relationshipTitle);
      });
    }
  }, {
    key: 'remove',
    value: function remove(t, id, relationshipTitle, childId) {
      var _this5 = this;

      return this[$axios].delete('/' + t.$name + '/' + id + '/' + relationshipTitle + '/' + childId).then(function () {
        return _this5.notifyUpdate(t, id, null, relationshipTitle);
      });
    }
  }, {
    key: 'modifyRelationship',
    value: function modifyRelationship(t, id, relationshipTitle, childId, extras) {
      var _this6 = this;

      return this[$axios].patch('/' + t.$name + '/' + id + '/' + relationshipTitle + '/' + childId, extras).then(function () {
        return _this6.notifyUpdate(t, id, null, relationshipTitle);
      });
    }
  }, {
    key: 'delete',
    value: function _delete(t, id) {
      return this[$axios].delete('/' + t.$name + '/' + id).then(function (response) {
        return response.data;
      });
    }
  }, {
    key: 'query',
    value: function query(q) {
      return this[$axios].get('/' + q.type, { params: q.query }).then(function (response) {
        return response.data;
      });
    }
  }]);

  return RestStore;
}(_plump.Storage);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3QuanMiXSwibmFtZXMiOlsiYXhpb3MiLCIkYXhpb3MiLCJTeW1ib2wiLCIkanNvbiIsIlJlc3RTdG9yZSIsIm9wdHMiLCJvcHRpb25zIiwiT2JqZWN0IiwiYXNzaWduIiwiYmFzZVVSTCIsInNjaGVtYXRhIiwiY3JlYXRlIiwidCIsInYiLCJyZXNvbHZlIiwidGhlbiIsIiRpZCIsInBhdGNoIiwiJG5hbWUiLCJ0ZXJtaW5hbCIsInBvc3QiLCJFcnJvciIsInJlc3BvbnNlIiwicmVzdWx0IiwicGFyc2UiLCJkYXRhIiwiZXh0ZW5kZWQiLCJmb3JFYWNoIiwibm90aWZ5VXBkYXRlIiwiaXRlbSIsInR5cGUiLCJpZCIsIiRpbmNsdWRlIiwiY29uY2F0Iiwicm9vdCIsImZpZWxkIiwiZ2V0IiwiY2F0Y2giLCJlcnIiLCJzdGF0dXMiLCJyZWxhdGlvbnNoaXAiLCJyZWxhdGlvbnNoaXBUaXRsZSIsImNoaWxkSWQiLCJleHRyYXMiLCJyZWxhdGlvbnNoaXBCbG9jayIsIiRmaWVsZHMiLCJzaWRlSW5mbyIsIiRzaWRlcyIsIm5ld0ZpZWxkIiwic2VsZiIsIm90aGVyIiwiJGV4dHJhcyIsImtleXMiLCJleHRyYSIsInB1dCIsImRlbGV0ZSIsInEiLCJwYXJhbXMiLCJxdWVyeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7O0lBQVlBLEs7O0FBQ1o7O0FBQ0E7O0FBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFGQSxJQUFNQyxTQUFTQyxPQUFPLFFBQVAsQ0FBZjtBQUNBLElBQU1DLFFBQVFELE9BQU8sT0FBUCxDQUFkOztJQUdhRSxTLFdBQUFBLFM7OztBQUNYLHVCQUF1QjtBQUFBLFFBQVhDLElBQVcsdUVBQUosRUFBSTs7QUFBQTs7QUFBQSxzSEFDZkEsSUFEZTs7QUFFckIsUUFBTUMsVUFBVUMsT0FBT0MsTUFBUCxDQUNkLEVBRGMsRUFFZDtBQUNFQyxlQUFTLHNCQURYO0FBRUVDLGdCQUFVO0FBRlosS0FGYyxFQU1kTCxJQU5jLENBQWhCO0FBUUEsVUFBS0os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aUJBQS9CLENBQU47QUFBQSxPQURDLENBQVA7QUFFRDs7OzRCQUVNN0IsQyxFQUFHbUIsRSxFQUFJO0FBQ1osYUFBTyxLQUFLOUIsTUFBTCxFQUFhc0QsTUFBYixPQUF3QjNDLEVBQUVNLEtBQTFCLFNBQW1DYSxFQUFuQyxFQUNOaEIsSUFETSxDQUNELFVBQUNPLFFBQUQsRUFBYztBQUNsQixlQUFPQSxTQUFTRyxJQUFoQjtBQUNELE9BSE0sQ0FBUDtBQUlEOzs7MEJBRUsrQixDLEVBQUc7QUFDUCxhQUFPLEtBQUt2RCxNQUFMLEVBQWFtQyxHQUFiLE9BQXFCb0IsRUFBRTFCLElBQXZCLEVBQStCLEVBQUUyQixRQUFRRCxFQUFFRSxLQUFaLEVBQS9CLEVBQ04zQyxJQURNLENBQ0QsVUFBQ08sUUFBRCxFQUFjO0FBQ2xCLGVBQU9BLFNBQVNHLElBQWhCO0FBQ0QsT0FITSxDQUFQO0FBSUQiLCJmaWxlIjoicmVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IFN0b3JhZ2UsICRzZWxmIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0IHsgSlNPTkFwaSB9IGZyb20gJ3BsdW1wLWpzb24tYXBpJztcblxuY29uc3QgJGF4aW9zID0gU3ltYm9sKCckYXhpb3MnKTtcbmNvbnN0ICRqc29uID0gU3ltYm9sKCckanNvbicpO1xuaW1wb3J0IFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuXG5leHBvcnQgY2xhc3MgUmVzdFN0b3JlIGV4dGVuZHMgU3RvcmFnZSB7XG4gIGNvbnN0cnVjdG9yKG9wdHMgPSB7fSkge1xuICAgIHN1cGVyKG9wdHMpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICB7XG4gICAgICAgIGJhc2VVUkw6ICdodHRwOi8vbG9jYWxob3N0L2FwaScsXG4gICAgICAgIHNjaGVtYXRhOiBbXSxcbiAgICAgIH0sXG4gICAgICBvcHRzXG4gICAgKTtcbiAgICB0aGlzWyRheGlvc10gPSBvcHRpb25zLmF4aW9zIHx8IGF4aW9zLmNyZWF0ZShvcHRpb25zKTtcbiAgICB0aGlzWyRqc29uXSA9IG5ldyBKU09OQXBpKHsgc2NoZW1hdGE6IG9wdGlvbnMuc2NoZW1hdGEsIGJhc2VVUkw6IG9wdGlvbnMuYmFzZVVSTCB9KTtcbiAgfVxuXG4gIHJlc3Qob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10ob3B0aW9ucyk7XG4gIH1cblxuICB3cml0ZSh0LCB2KSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHZbdC4kaWRdKSB7XG4gICAgICAgIHJldHVybiB0aGlzWyRheGlvc10ucGF0Y2goYC8ke3QuJG5hbWV9LyR7dlt0LiRpZF19YCwgdik7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudGVybWluYWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5wb3N0KGAvJHt0LiRuYW1lfWAsIHYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY3JlYXRlIG5ldyBjb250ZW50IGluIGEgbm9uLXRlcm1pbmFsIHN0b3JlJyk7XG4gICAgICB9XG4gICAgfSlcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXNbJGpzb25dLnBhcnNlKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgcmVzdWx0LmV4dGVuZGVkLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgIC8vIGl0ZW0udHlwZSBpcyBjdXJyZW50bHkganVzdCBhIHN0cmluZy5cbiAgICAgICAgLy8gVE9ETzogRmlndXJlIG91dCBob3cgdG8gbWFrZSBpdCBhbiBhY3R1YWwgVHlwZVxuICAgICAgICAvLyBPUiBjaGFuZ2UgaG93IG5vdGlmeVVwZGF0ZSB3b3Jrc1xuICAgICAgICB0aGlzLm5vdGlmeVVwZGF0ZShpdGVtLnR5cGUsIGl0ZW0uaWQsIGl0ZW0sIGl0ZW0udHlwZS4kaW5jbHVkZS5jb25jYXQoJHNlbGYpKTtcbiAgICAgIH0pO1xuICAgICAgY29uc3Qgcm9vdCA9IHt9O1xuICAgICAgZm9yIChjb25zdCBmaWVsZCBpbiByZXN1bHQucm9vdCkge1xuICAgICAgICBpZiAoZmllbGQgIT09ICd0eXBlJykge1xuICAgICAgICAgIHJvb3RbZmllbGRdID0gcmVzdWx0LnJvb3RbZmllbGRdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcm9vdDtcbiAgICB9KVxuICAgIC50aGVuKChyZXN1bHQpID0+IHRoaXMubm90aWZ5VXBkYXRlKHQsIHJlc3VsdFt0LiRpZF0sIHJlc3VsdCkudGhlbigoKSA9PiByZXN1bHQpKTtcbiAgfVxuXG4gIHJlYWRPbmUodCwgaWQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAudGhlbigoKSA9PiB0aGlzWyRheGlvc10uZ2V0KGAvJHt0LiRuYW1lfS8ke2lkfWApKVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gdGhpc1skanNvbl0ucGFyc2UocmVzcG9uc2UuZGF0YSk7XG4gICAgICByZXN1bHQuZXh0ZW5kZWQuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgLy8gaXRlbS50eXBlIGlzIGN1cnJlbnRseSBqdXN0IGEgc3RyaW5nLlxuICAgICAgICAvLyBUT0RPOiBGaWd1cmUgb3V0IGhvdyB0byBtYWtlIGl0IGFuIGFjdHVhbCBUeXBlXG4gICAgICAgIC8vIE9SIGNoYW5nZSBob3cgbm90aWZ5VXBkYXRlIHdvcmtzXG4gICAgICAgIHRoaXMubm90aWZ5VXBkYXRlKGl0ZW0udHlwZSwgaXRlbS5pZCwgaXRlbSwgaXRlbS50eXBlLiRpbmNsdWRlLmNvbmNhdCgkc2VsZikpO1xuICAgICAgfSk7XG4gICAgICBjb25zdCByb290ID0ge307XG4gICAgICBmb3IgKGNvbnN0IGZpZWxkIGluIHJlc3VsdC5yb290KSB7XG4gICAgICAgIGlmIChmaWVsZCAhPT0gJ3R5cGUnKSB7XG4gICAgICAgICAgcm9vdFtmaWVsZF0gPSByZXN1bHQucm9vdFtmaWVsZF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByb290O1xuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVhZE1hbnkodCwgaWQsIHJlbGF0aW9uc2hpcCkge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10uZ2V0KGAvJHt0LiRuYW1lfS8ke2lkfS8ke3JlbGF0aW9uc2hpcH1gKVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuZGF0YSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgaWYgKGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYWRkKHR5cGUsIGlkLCByZWxhdGlvbnNoaXBUaXRsZSwgY2hpbGRJZCwgZXh0cmFzKSB7XG4gICAgY29uc3QgcmVsYXRpb25zaGlwQmxvY2sgPSB0eXBlLiRmaWVsZHNbcmVsYXRpb25zaGlwVGl0bGVdO1xuICAgIGNvbnN0IHNpZGVJbmZvID0gcmVsYXRpb25zaGlwQmxvY2sucmVsYXRpb25zaGlwLiRzaWRlc1tyZWxhdGlvbnNoaXBUaXRsZV07XG4gICAgY29uc3QgbmV3RmllbGQgPSB7IFtzaWRlSW5mby5zZWxmLmZpZWxkXTogaWQsIFtzaWRlSW5mby5vdGhlci5maWVsZF06IGNoaWxkSWQgfTtcbiAgICBpZiAocmVsYXRpb25zaGlwQmxvY2sucmVsYXRpb25zaGlwLiRleHRyYXMpIHtcbiAgICAgIE9iamVjdC5rZXlzKHJlbGF0aW9uc2hpcEJsb2NrLnJlbGF0aW9uc2hpcC4kZXh0cmFzKS5mb3JFYWNoKChleHRyYSkgPT4ge1xuICAgICAgICBuZXdGaWVsZFtleHRyYV0gPSBleHRyYXNbZXh0cmFdO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzWyRheGlvc10ucHV0KGAvJHt0eXBlLiRuYW1lfS8ke2lkfS8ke3JlbGF0aW9uc2hpcFRpdGxlfWAsIG5ld0ZpZWxkKVxuICAgIC50aGVuKCgpID0+IHRoaXMubm90aWZ5VXBkYXRlKHR5cGUsIGlkLCBudWxsLCByZWxhdGlvbnNoaXBUaXRsZSkpO1xuICB9XG5cbiAgcmVtb3ZlKHQsIGlkLCByZWxhdGlvbnNoaXBUaXRsZSwgY2hpbGRJZCkge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10uZGVsZXRlKGAvJHt0LiRuYW1lfS8ke2lkfS8ke3JlbGF0aW9uc2hpcFRpdGxlfS8ke2NoaWxkSWR9YClcbiAgICAudGhlbigoKSA9PiB0aGlzLm5vdGlmeVVwZGF0ZSh0LCBpZCwgbnVsbCwgcmVsYXRpb25zaGlwVGl0bGUpKTtcbiAgfVxuXG4gIG1vZGlmeVJlbGF0aW9uc2hpcCh0LCBpZCwgcmVsYXRpb25zaGlwVGl0bGUsIGNoaWxkSWQsIGV4dHJhcykge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10ucGF0Y2goYC8ke3QuJG5hbWV9LyR7aWR9LyR7cmVsYXRpb25zaGlwVGl0bGV9LyR7Y2hpbGRJZH1gLCBleHRyYXMpXG4gICAgLnRoZW4oKCkgPT4gdGhpcy5ub3RpZnlVcGRhdGUodCwgaWQsIG51bGwsIHJlbGF0aW9uc2hpcFRpdGxlKSk7XG4gIH1cblxuICBkZWxldGUodCwgaWQpIHtcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLmRlbGV0ZShgLyR7dC4kbmFtZX0vJHtpZH1gKVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgfSk7XG4gIH1cblxuICBxdWVyeShxKSB7XG4gICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5nZXQoYC8ke3EudHlwZX1gLCB7IHBhcmFtczogcS5xdWVyeSB9KVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
