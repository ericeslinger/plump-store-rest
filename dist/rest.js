'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RestStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

var _plump = require('plump');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var $axios = Symbol('$axios');
var $schemata = Symbol('$schemata');

var RestStore = exports.RestStore = function (_Storage) {
  _inherits(RestStore, _Storage);

  function RestStore() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RestStore);

    var _this = _possibleConstructorReturn(this, (RestStore.__proto__ || Object.getPrototypeOf(RestStore)).call(this, opts));

    var options = Object.assign({}, { baseURL: 'http://localhost/api', schemata: [] }, opts);
    _this[$axios] = options.axios || axios.create(options);
    _this[$schemata] = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = options.schemata[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var schema = _step.value;

        _this.addSchema(schema);
      }
      // options.schemata.forEach(this.addSchema);
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return _this;
  }

  _createClass(RestStore, [{
    key: 'addSchema',
    value: function addSchema(schema) {
      if (this[$schemata][schema.$name]) {
        throw new Error('Attempting to register duplicate type: ' + schema.$name);
      } else {
        this[$schemata][schema.$name] = schema;
      }
    }
  }, {
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
        var data = response.data;
        return _this2.notifyUpdate(t, data.id, data).then(function () {
          return data;
        });
      });
    }
  }, {
    key: 'read',
    value: function read(t, id) {
      var _this3 = this;

      return this[$axios].get('/' + t.$name + '/' + id).then(function (response) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = response.included[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var item = _step2.value;

            var schema = _this3[$schemata][item.type];
            var fields = ['attributes'].concat(Object.keys(item.relationships));
            if (!schema) {
              console.warn('RestStore received unknown type \'' + item.type + '\' in HTTP response');
            }
            _this3.notifyUpdate(schema, item.id, item, fields);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return response.data;
      }).catch(function (err) {
        if (err.response && err.response.status === 404) {
          return null;
        } else {
          throw err;
        }
      });
    }
  }, {
    key: 'readAttributes',
    value: function readAttributes(t, id) {
      return this.read(t, id).then(function (item) {
        return item ? item.attributes : null;
      }).catch(function (err) {
        throw err;
      });
    }
  }, {
    key: 'readRelationship',
    value: function readRelationship(t, id, relationship) {
      return this.read(t, id).then(function (item) {
        return item ? item.relationships[relationship] : null;
      }).catch(function (err) {
        throw err;
      });
    }
  }, {
    key: 'add',
    value: function add(type, id, relationshipTitle, childId, extras) {
      var _this4 = this;

      var relationshipBlock = type.$schema.relationships[relationshipTitle].type;
      var newField = { id: id };
      if (relationshipBlock.$extras) {
        for (var extra in extras) {
          if (extra in relationshipBlock.$extras) {
            newField[extra] = extras[extra];
          }
        }
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
        return response.data.data;
      });
    }
  }, {
    key: 'query',
    value: function query(q) {
      return this[$axios].get('/' + q.type, { params: q.query }).then(function (response) {
        return response.data.data;
      });
    }
  }]);

  return RestStore;
}(_plump.Storage);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3QuanMiXSwibmFtZXMiOlsiYXhpb3MiLCIkYXhpb3MiLCJTeW1ib2wiLCIkc2NoZW1hdGEiLCJSZXN0U3RvcmUiLCJvcHRzIiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsImJhc2VVUkwiLCJzY2hlbWF0YSIsImNyZWF0ZSIsInNjaGVtYSIsImFkZFNjaGVtYSIsIiRuYW1lIiwiRXJyb3IiLCJ0IiwidiIsInJlc29sdmUiLCJ0aGVuIiwiJGlkIiwicGF0Y2giLCJ0ZXJtaW5hbCIsInBvc3QiLCJkYXRhIiwicmVzcG9uc2UiLCJub3RpZnlVcGRhdGUiLCJpZCIsImdldCIsImluY2x1ZGVkIiwiaXRlbSIsInR5cGUiLCJmaWVsZHMiLCJjb25jYXQiLCJrZXlzIiwicmVsYXRpb25zaGlwcyIsImNvbnNvbGUiLCJ3YXJuIiwiY2F0Y2giLCJlcnIiLCJzdGF0dXMiLCJyZWFkIiwiYXR0cmlidXRlcyIsInJlbGF0aW9uc2hpcCIsInJlbGF0aW9uc2hpcFRpdGxlIiwiY2hpbGRJZCIsImV4dHJhcyIsInJlbGF0aW9uc2hpcEJsb2NrIiwiJHNjaGVtYSIsIm5ld0ZpZWxkIiwiJGV4dHJhcyIsImV4dHJhIiwicHV0IiwiZGVsZXRlIiwicSIsInBhcmFtcyIsInF1ZXJ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7SUFBWUEsSzs7QUFDWjs7QUFJQTs7Ozs7Ozs7Ozs7Ozs7QUFGQSxJQUFNQyxTQUFTQyxPQUFPLFFBQVAsQ0FBZjtBQUNBLElBQU1DLFlBQVlELE9BQU8sV0FBUCxDQUFsQjs7SUFHYUUsUyxXQUFBQSxTOzs7QUFDWCx1QkFBdUI7QUFBQSxRQUFYQyxJQUFXLHVFQUFKLEVBQUk7O0FBQUE7O0FBQUEsc0hBQ2ZBLElBRGU7O0FBRXJCLFFBQU1DLFVBQVVDLE9BQU9DLE1BQVAsQ0FDZCxFQURjLEVBRWQsRUFBRUMsU0FBUyxzQkFBWCxFQUFtQ0MsVUFBVSxFQUE3QyxFQUZjLEVBR2RMLElBSGMsQ0FBaEI7QUFLQSxVQUFLSixNQUFMLElB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dkIsRUFBK0IsRUFBRXdCLFFBQVFELEVBQUVFLEtBQVosRUFBL0IsRUFDTnJDLElBRE0sQ0FDRCxvQkFBWTtBQUNoQixlQUFPTSxTQUFTRCxJQUFULENBQWNBLElBQXJCO0FBQ0QsT0FITSxDQUFQO0FBSUQiLCJmaWxlIjoicmVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IFN0b3JhZ2UgfSBmcm9tICdwbHVtcCc7XG5cbmNvbnN0ICRheGlvcyA9IFN5bWJvbCgnJGF4aW9zJyk7XG5jb25zdCAkc2NoZW1hdGEgPSBTeW1ib2woJyRzY2hlbWF0YScpO1xuaW1wb3J0IFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuXG5leHBvcnQgY2xhc3MgUmVzdFN0b3JlIGV4dGVuZHMgU3RvcmFnZSB7XG4gIGNvbnN0cnVjdG9yKG9wdHMgPSB7fSkge1xuICAgIHN1cGVyKG9wdHMpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICB7IGJhc2VVUkw6ICdodHRwOi8vbG9jYWxob3N0L2FwaScsIHNjaGVtYXRhOiBbXSB9LFxuICAgICAgb3B0c1xuICAgICk7XG4gICAgdGhpc1skYXhpb3NdID0gb3B0aW9ucy5heGlvcyB8fCBheGlvcy5jcmVhdGUob3B0aW9ucyk7XG4gICAgdGhpc1skc2NoZW1hdGFdID0ge307XG4gICAgZm9yIChjb25zdCBzY2hlbWEgb2Ygb3B0aW9ucy5zY2hlbWF0YSkge1xuICAgICAgdGhpcy5hZGRTY2hlbWEoc2NoZW1hKTtcbiAgICB9XG4gICAgLy8gb3B0aW9ucy5zY2hlbWF0YS5mb3JFYWNoKHRoaXMuYWRkU2NoZW1hKTtcbiAgfVxuXG4gIGFkZFNjaGVtYShzY2hlbWEpIHtcbiAgICBpZiAodGhpc1skc2NoZW1hdGFdW3NjaGVtYS4kbmFtZV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXR0ZW1wdGluZyB0byByZWdpc3RlciBkdXBsaWNhdGUgdHlwZTogJHtzY2hlbWEuJG5hbWV9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbJHNjaGVtYXRhXVtzY2hlbWEuJG5hbWVdID0gc2NoZW1hO1xuICAgIH1cbiAgfVxuXG4gIHJlc3Qob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10ob3B0aW9ucyk7XG4gIH1cblxuICB3cml0ZSh0LCB2KSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHZbdC4kaWRdKSB7XG4gICAgICAgIHJldHVybiB0aGlzWyRheGlvc10ucGF0Y2goYC8ke3QuJG5hbWV9LyR7dlt0LiRpZF19YCwgdik7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudGVybWluYWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5wb3N0KGAvJHt0LiRuYW1lfWAsIHYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY3JlYXRlIG5ldyBjb250ZW50IGluIGEgbm9uLXRlcm1pbmFsIHN0b3JlJyk7XG4gICAgICB9XG4gICAgfSlcbiAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgIHJldHVybiB0aGlzLm5vdGlmeVVwZGF0ZSh0LCBkYXRhLmlkLCBkYXRhKS50aGVuKCgpID0+IGRhdGEpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVhZCh0LCBpZCkge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10uZ2V0KGAvJHt0LiRuYW1lfS8ke2lkfWApXG4gICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHJlc3BvbnNlLmluY2x1ZGVkKSB7XG4gICAgICAgIGNvbnN0IHNjaGVtYSA9IHRoaXNbJHNjaGVtYXRhXVtpdGVtLnR5cGVdO1xuICAgICAgICBjb25zdCBmaWVsZHMgPSBbJ2F0dHJpYnV0ZXMnXS5jb25jYXQoT2JqZWN0LmtleXMoaXRlbS5yZWxhdGlvbnNoaXBzKSk7XG4gICAgICAgIGlmICghc2NoZW1hKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBSZXN0U3RvcmUgcmVjZWl2ZWQgdW5rbm93biB0eXBlICcke2l0ZW0udHlwZX0nIGluIEhUVFAgcmVzcG9uc2VgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vdGlmeVVwZGF0ZShzY2hlbWEsIGl0ZW0uaWQsIGl0ZW0sIGZpZWxkcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgaWYgKGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZWFkQXR0cmlidXRlcyh0LCBpZCkge1xuICAgIHJldHVybiB0aGlzLnJlYWQodCwgaWQpXG4gICAgLnRoZW4oaXRlbSA9PiBpdGVtID8gaXRlbS5hdHRyaWJ1dGVzIDogbnVsbClcbiAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9KTtcbiAgfVxuXG4gIHJlYWRSZWxhdGlvbnNoaXAodCwgaWQsIHJlbGF0aW9uc2hpcCkge1xuICAgIHJldHVybiB0aGlzLnJlYWQodCwgaWQpXG4gICAgLnRoZW4oaXRlbSA9PiBpdGVtID8gaXRlbS5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcF0gOiBudWxsKVxuICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH0pO1xuICB9XG5cbiAgYWRkKHR5cGUsIGlkLCByZWxhdGlvbnNoaXBUaXRsZSwgY2hpbGRJZCwgZXh0cmFzKSB7XG4gICAgY29uc3QgcmVsYXRpb25zaGlwQmxvY2sgPSB0eXBlLiRzY2hlbWEucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBUaXRsZV0udHlwZTtcbiAgICBjb25zdCBuZXdGaWVsZCA9IHsgaWQgfTtcbiAgICBpZiAocmVsYXRpb25zaGlwQmxvY2suJGV4dHJhcykge1xuICAgICAgZm9yIChjb25zdCBleHRyYSBpbiBleHRyYXMpIHtcbiAgICAgICAgaWYgKGV4dHJhIGluIHJlbGF0aW9uc2hpcEJsb2NrLiRleHRyYXMpIHtcbiAgICAgICAgICBuZXdGaWVsZFtleHRyYV0gPSBleHRyYXNbZXh0cmFdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzWyRheGlvc10ucHV0KGAvJHt0eXBlLiRuYW1lfS8ke2lkfS8ke3JlbGF0aW9uc2hpcFRpdGxlfWAsIG5ld0ZpZWxkKVxuICAgIC50aGVuKCgpID0+IHRoaXMubm90aWZ5VXBkYXRlKHR5cGUsIGlkLCBudWxsLCByZWxhdGlvbnNoaXBUaXRsZSkpO1xuICB9XG5cbiAgcmVtb3ZlKHQsIGlkLCByZWxhdGlvbnNoaXBUaXRsZSwgY2hpbGRJZCkge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10uZGVsZXRlKGAvJHt0LiRuYW1lfS8ke2lkfS8ke3JlbGF0aW9uc2hpcFRpdGxlfS8ke2NoaWxkSWR9YClcbiAgICAudGhlbigoKSA9PiB0aGlzLm5vdGlmeVVwZGF0ZSh0LCBpZCwgbnVsbCwgcmVsYXRpb25zaGlwVGl0bGUpKTtcbiAgfVxuXG4gIG1vZGlmeVJlbGF0aW9uc2hpcCh0LCBpZCwgcmVsYXRpb25zaGlwVGl0bGUsIGNoaWxkSWQsIGV4dHJhcykge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10ucGF0Y2goYC8ke3QuJG5hbWV9LyR7aWR9LyR7cmVsYXRpb25zaGlwVGl0bGV9LyR7Y2hpbGRJZH1gLCBleHRyYXMpXG4gICAgLnRoZW4oKCkgPT4gdGhpcy5ub3RpZnlVcGRhdGUodCwgaWQsIG51bGwsIHJlbGF0aW9uc2hpcFRpdGxlKSk7XG4gIH1cblxuICBkZWxldGUodCwgaWQpIHtcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLmRlbGV0ZShgLyR7dC4kbmFtZX0vJHtpZH1gKVxuICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhLmRhdGE7XG4gICAgfSk7XG4gIH1cblxuICBxdWVyeShxKSB7XG4gICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5nZXQoYC8ke3EudHlwZX1gLCB7IHBhcmFtczogcS5xdWVyeSB9KVxuICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhLmRhdGE7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
