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
        result.extended.forEach(function (item, index) {
          var schema = _this2[$json].schema(item.type);
          var childRelationships = response.data.included[index].relationships;
          _this2.notifyUpdate(schema, item.id, item, Object.keys(childRelationships).concat(_plump.$self));
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
        result.extended.forEach(function (item, index) {
          var schema = _this3[$json].schema(item.type);
          var childRelationships = response.data.included[index].relationships;
          _this3.notifyUpdate(schema, item.id, item, Object.keys(childRelationships).concat(_plump.$self));
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3QuanMiXSwibmFtZXMiOlsiYXhpb3MiLCIkYXhpb3MiLCJTeW1ib2wiLCIkanNvbiIsIlJlc3RTdG9yZSIsIm9wdHMiLCJvcHRpb25zIiwiT2JqZWN0IiwiYXNzaWduIiwiYmFzZVVSTCIsInNjaGVtYXRhIiwiY3JlYXRlIiwidCIsInYiLCJyZXNvbHZlIiwidGhlbiIsIiRpZCIsInBhdGNoIiwiJG5hbWUiLCJ0ZXJtaW5hbCIsInBvc3QiLCJFcnJvciIsInJlc3BvbnNlIiwicmVzdWx0IiwicGFyc2UiLCJkYXRhIiwiZXh0ZW5kZWQiLCJmb3JFYWNoIiwiaXRlbSIsImluZGV4Iiwic2NoZW1hIiwidHlwZSIsImNoaWxkUmVsYXRpb25zaGlwcyIsImluY2x1ZGVkIiwicmVsYXRpb25zaGlwcyIsIm5vdGlmeVVwZGF0ZSIsImlkIiwia2V5cyIsImNvbmNhdCIsInJvb3QiLCJmaWVsZCIsImdldCIsImNhdGNoIiwiZXJyIiwic3RhdHVzIiwicmVsYXRpb25zaGlwIiwicmVsYXRpb25zaGlwVGl0bGUiLCJjaGlsZElkIiwiZXh0cmFzIiwicmVsYXRpb25zaGlwQmxvY2siLCIkZmllbGRzIiwic2lkZUluZm8iLCIkc2lkZXMiLCJuZXdGaWVsZCIsInNlbGYiLCJvdGhlciIsIiRleHRyYXMiLCJleHRyYSIsInB1dCIsImRlbGV0ZSIsInEiLCJwYXJhbXMiLCJxdWVyeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7O0lBQVlBLEs7O0FBQ1o7O0FBQ0E7O0FBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFGQSxJQUFNQyxTQUFTQyxPQUFPLFFBQVAsQ0FBZjtBQUNBLElBQU1DLFFBQVFELE9BQU8sT0FBUCxDQUFkOztJQUdhRSxTLFdBQUFBLFM7OztBQUNYLHVCQUF1QjtBQUFBLFFBQVhDLElBQVcsdUVBQUosRUFBSTs7QUFBQTs7QUFBQSxzSEFDZkEsSUFEZTs7QUFFckIsUUFBTUMsVUFBVUMsT0FBT0MsTUFBUCxDQUNkLEVBRGMsRUFFZDtBQUNFQyxlQUFTLHNC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QUFLb0IsWUFBTCxDQUFrQnZCLENBQWxCLEVBQXFCd0IsRUFBckIsRUFBeUIsSUFBekIsRUFBK0JVLGlCQUEvQixDQUFOO0FBQUEsT0FEQyxDQUFQO0FBRUQ7Ozt1Q0FFa0JsQyxDLEVBQUd3QixFLEVBQUlVLGlCLEVBQW1CQyxPLEVBQVNDLE0sRUFBUTtBQUFBOztBQUM1RCxhQUFPLEtBQUsvQyxNQUFMLEVBQWFnQixLQUFiLE9BQXVCTCxFQUFFTSxLQUF6QixTQUFrQ2tCLEVBQWxDLFNBQXdDVSxpQkFBeEMsU0FBNkRDLE9BQTdELEVBQXdFQyxNQUF4RSxFQUNOakMsSUFETSxDQUNEO0FBQUEsZUFBTSxPQUFLb0IsWUFBTCxDQUFrQnZCLENBQWxCLEVBQXFCd0IsRUFBckIsRUFBeUIsSUFBekIsRUFBK0JVLGlCQUEvQixDQUFOO0FBQUEsT0FEQyxDQUFQO0FBRUQ7Ozs0QkFFTWxDLEMsRUFBR3dCLEUsRUFBSTtBQUNaLGFBQU8sS0FBS25DLE1BQUwsRUFBYTBELE1BQWIsT0FBd0IvQyxFQUFFTSxLQUExQixTQUFtQ2tCLEVBQW5DLEVBQ05yQixJQURNLENBQ0QsVUFBQ08sUUFBRCxFQUFjO0FBQ2xCLGVBQU9BLFNBQVNHLElBQWhCO0FBQ0QsT0FITSxDQUFQO0FBSUQ7OzswQkFFS21DLEMsRUFBRztBQUNQLGFBQU8sS0FBSzNELE1BQUwsRUFBYXdDLEdBQWIsT0FBcUJtQixFQUFFN0IsSUFBdkIsRUFBK0IsRUFBRThCLFFBQVFELEVBQUVFLEtBQVosRUFBL0IsRUFDTi9DLElBRE0sQ0FDRCxVQUFDTyxRQUFELEVBQWM7QUFDbEIsZUFBT0EsU0FBU0csSUFBaEI7QUFDRCxPQUhNLENBQVA7QUFJRCIsImZpbGUiOiJyZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHsgU3RvcmFnZSwgJHNlbGYgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQgeyBKU09OQXBpIH0gZnJvbSAncGx1bXAtanNvbi1hcGknO1xuXG5jb25zdCAkYXhpb3MgPSBTeW1ib2woJyRheGlvcycpO1xuY29uc3QgJGpzb24gPSBTeW1ib2woJyRqc29uJyk7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICdibHVlYmlyZCc7XG5cbmV4cG9ydCBjbGFzcyBSZXN0U3RvcmUgZXh0ZW5kcyBTdG9yYWdlIHtcbiAgY29uc3RydWN0b3Iob3B0cyA9IHt9KSB7XG4gICAgc3VwZXIob3B0cyk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7fSxcbiAgICAgIHtcbiAgICAgICAgYmFzZVVSTDogJ2h0dHA6Ly9sb2NhbGhvc3QvYXBpJyxcbiAgICAgICAgc2NoZW1hdGE6IFtdLFxuICAgICAgfSxcbiAgICAgIG9wdHNcbiAgICApO1xuICAgIHRoaXNbJGF4aW9zXSA9IG9wdGlvbnMuYXhpb3MgfHwgYXhpb3MuY3JlYXRlKG9wdGlvbnMpO1xuICAgIHRoaXNbJGpzb25dID0gbmV3IEpTT05BcGkoeyBzY2hlbWF0YTogb3B0aW9ucy5zY2hlbWF0YSwgYmFzZVVSTDogb3B0aW9ucy5iYXNlVVJMIH0pO1xuICB9XG5cbiAgcmVzdChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXNbJGF4aW9zXShvcHRpb25zKTtcbiAgfVxuXG4gIHdyaXRlKHQsIHYpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICBpZiAodlt0LiRpZF0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5wYXRjaChgLyR7dC4kbmFtZX0vJHt2W3QuJGlkXX1gLCB2KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50ZXJtaW5hbCkge1xuICAgICAgICByZXR1cm4gdGhpc1skYXhpb3NdLnBvc3QoYC8ke3QuJG5hbWV9YCwgdik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjcmVhdGUgbmV3IGNvbnRlbnQgaW4gYSBub24tdGVybWluYWwgc3RvcmUnKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gdGhpc1skanNvbl0ucGFyc2UocmVzcG9uc2UuZGF0YSk7XG4gICAgICByZXN1bHQuZXh0ZW5kZWQuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qgc2NoZW1hID0gdGhpc1skanNvbl0uc2NoZW1hKGl0ZW0udHlwZSk7XG4gICAgICAgIGNvbnN0IGNoaWxkUmVsYXRpb25zaGlwcyA9IHJlc3BvbnNlLmRhdGEuaW5jbHVkZWRbaW5kZXhdLnJlbGF0aW9uc2hpcHM7XG4gICAgICAgIHRoaXMubm90aWZ5VXBkYXRlKHNjaGVtYSwgaXRlbS5pZCwgaXRlbSwgT2JqZWN0LmtleXMoY2hpbGRSZWxhdGlvbnNoaXBzKS5jb25jYXQoJHNlbGYpKTtcbiAgICAgIH0pO1xuICAgICAgY29uc3Qgcm9vdCA9IHt9O1xuICAgICAgZm9yIChjb25zdCBmaWVsZCBpbiByZXN1bHQucm9vdCkge1xuICAgICAgICBpZiAoZmllbGQgIT09ICd0eXBlJykge1xuICAgICAgICAgIHJvb3RbZmllbGRdID0gcmVzdWx0LnJvb3RbZmllbGRdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcm9vdDtcbiAgICB9KVxuICAgIC50aGVuKChyZXN1bHQpID0+IHRoaXMubm90aWZ5VXBkYXRlKHQsIHJlc3VsdFt0LiRpZF0sIHJlc3VsdCkudGhlbigoKSA9PiByZXN1bHQpKTtcbiAgfVxuXG4gIHJlYWRPbmUodCwgaWQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAudGhlbigoKSA9PiB0aGlzWyRheGlvc10uZ2V0KGAvJHt0LiRuYW1lfS8ke2lkfWApKVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gdGhpc1skanNvbl0ucGFyc2UocmVzcG9uc2UuZGF0YSk7XG4gICAgICByZXN1bHQuZXh0ZW5kZWQuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qgc2NoZW1hID0gdGhpc1skanNvbl0uc2NoZW1hKGl0ZW0udHlwZSk7XG4gICAgICAgIGNvbnN0IGNoaWxkUmVsYXRpb25zaGlwcyA9IHJlc3BvbnNlLmRhdGEuaW5jbHVkZWRbaW5kZXhdLnJlbGF0aW9uc2hpcHM7XG4gICAgICAgIHRoaXMubm90aWZ5VXBkYXRlKHNjaGVtYSwgaXRlbS5pZCwgaXRlbSwgT2JqZWN0LmtleXMoY2hpbGRSZWxhdGlvbnNoaXBzKS5jb25jYXQoJHNlbGYpKTtcbiAgICAgIH0pO1xuICAgICAgY29uc3Qgcm9vdCA9IHt9O1xuICAgICAgZm9yIChjb25zdCBmaWVsZCBpbiByZXN1bHQucm9vdCkge1xuICAgICAgICBpZiAoZmllbGQgIT09ICd0eXBlJykge1xuICAgICAgICAgIHJvb3RbZmllbGRdID0gcmVzdWx0LnJvb3RbZmllbGRdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcm9vdDtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlYWRNYW55KHQsIGlkLCByZWxhdGlvbnNoaXApIHtcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLmdldChgLyR7dC4kbmFtZX0vJHtpZH0vJHtyZWxhdGlvbnNoaXB9YClcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmRhdGEpXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFkZCh0eXBlLCBpZCwgcmVsYXRpb25zaGlwVGl0bGUsIGNoaWxkSWQsIGV4dHJhcykge1xuICAgIGNvbnN0IHJlbGF0aW9uc2hpcEJsb2NrID0gdHlwZS4kZmllbGRzW3JlbGF0aW9uc2hpcFRpdGxlXTtcbiAgICBjb25zdCBzaWRlSW5mbyA9IHJlbGF0aW9uc2hpcEJsb2NrLnJlbGF0aW9uc2hpcC4kc2lkZXNbcmVsYXRpb25zaGlwVGl0bGVdO1xuICAgIGNvbnN0IG5ld0ZpZWxkID0geyBbc2lkZUluZm8uc2VsZi5maWVsZF06IGlkLCBbc2lkZUluZm8ub3RoZXIuZmllbGRdOiBjaGlsZElkIH07XG4gICAgaWYgKHJlbGF0aW9uc2hpcEJsb2NrLnJlbGF0aW9uc2hpcC4kZXh0cmFzKSB7XG4gICAgICBPYmplY3Qua2V5cyhyZWxhdGlvbnNoaXBCbG9jay5yZWxhdGlvbnNoaXAuJGV4dHJhcykuZm9yRWFjaCgoZXh0cmEpID0+IHtcbiAgICAgICAgbmV3RmllbGRbZXh0cmFdID0gZXh0cmFzW2V4dHJhXTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLnB1dChgLyR7dHlwZS4kbmFtZX0vJHtpZH0vJHtyZWxhdGlvbnNoaXBUaXRsZX1gLCBuZXdGaWVsZClcbiAgICAudGhlbigoKSA9PiB0aGlzLm5vdGlmeVVwZGF0ZSh0eXBlLCBpZCwgbnVsbCwgcmVsYXRpb25zaGlwVGl0bGUpKTtcbiAgfVxuXG4gIHJlbW92ZSh0LCBpZCwgcmVsYXRpb25zaGlwVGl0bGUsIGNoaWxkSWQpIHtcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLmRlbGV0ZShgLyR7dC4kbmFtZX0vJHtpZH0vJHtyZWxhdGlvbnNoaXBUaXRsZX0vJHtjaGlsZElkfWApXG4gICAgLnRoZW4oKCkgPT4gdGhpcy5ub3RpZnlVcGRhdGUodCwgaWQsIG51bGwsIHJlbGF0aW9uc2hpcFRpdGxlKSk7XG4gIH1cblxuICBtb2RpZnlSZWxhdGlvbnNoaXAodCwgaWQsIHJlbGF0aW9uc2hpcFRpdGxlLCBjaGlsZElkLCBleHRyYXMpIHtcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLnBhdGNoKGAvJHt0LiRuYW1lfS8ke2lkfS8ke3JlbGF0aW9uc2hpcFRpdGxlfS8ke2NoaWxkSWR9YCwgZXh0cmFzKVxuICAgIC50aGVuKCgpID0+IHRoaXMubm90aWZ5VXBkYXRlKHQsIGlkLCBudWxsLCByZWxhdGlvbnNoaXBUaXRsZSkpO1xuICB9XG5cbiAgZGVsZXRlKHQsIGlkKSB7XG4gICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5kZWxldGUoYC8ke3QuJG5hbWV9LyR7aWR9YClcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgcXVlcnkocSkge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10uZ2V0KGAvJHtxLnR5cGV9YCwgeyBwYXJhbXM6IHEucXVlcnkgfSlcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
