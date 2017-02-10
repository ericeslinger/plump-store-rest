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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var $axios = Symbol('$axios');

var RestStore = exports.RestStore = function (_Storage) {
  _inherits(RestStore, _Storage);

  function RestStore() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RestStore);

    var _this = _possibleConstructorReturn(this, (RestStore.__proto__ || Object.getPrototypeOf(RestStore)).call(this, opts));

    var options = Object.assign({}, {
      baseURL: 'http://localhost/api'
    }, opts);
    _this[$axios] = options.axios || axios.create(options);
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
      }).then(function (d) {
        return d.data[t.$name][0];
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
        return response.data[t.$name][0];
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3QuanMiXSwibmFtZXMiOlsiYXhpb3MiLCIkYXhpb3MiLCJTeW1ib2wiLCJSZXN0U3RvcmUiLCJvcHRzIiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsImJhc2VVUkwiLCJjcmVhdGUiLCJ0IiwidiIsInJlc29sdmUiLCJ0aGVuIiwiJGlkIiwicGF0Y2giLCIkbmFtZSIsInRlcm1pbmFsIiwicG9zdCIsIkVycm9yIiwiZCIsImRhdGEiLCJyZXN1bHQiLCJub3RpZnlVcGRhdGUiLCJpZCIsImdldCIsInJlc3BvbnNlIiwiY2F0Y2giLCJlcnIiLCJzdGF0dXMiLCJyZWxhdGlvbnNoaXAiLCJ0eXBlIiwicmVsYXRpb25zaGlwVGl0bGUiLCJjaGlsZElkIiwiZXh0cmFzIiwicmVsYXRpb25zaGlwQmxvY2siLCIkZmllbGRzIiwic2lkZUluZm8iLCIkc2lkZXMiLCJuZXdGaWVsZCIsInNlbGYiLCJmaWVsZCIsIm90aGVyIiwiJGV4dHJhcyIsImtleXMiLCJmb3JFYWNoIiwiZXh0cmEiLCJwdXQiLCJkZWxldGUiLCJxIiwicGFyYW1zIiwicXVlcnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOztJQUFZQSxLOztBQUNaOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7O0FBREEsSUFBTUMsU0FBU0MsT0FBTyxRQUFQLENBQWY7O0lBR2FDLFMsV0FBQUEsUzs7O0FBRVgsdUJBQXVCO0FBQUEsUUFBWEMsSUFBVyx1RUFBSixFQUFJOztBQUFBOztBQUFBLHNIQUNmQSxJQURlOztBQUVyQixRQUFNQyxVQUFVQyxPQUFPQyxNQUFQLENBQ2QsRUFEYyxFQUVkO0FBQ0VDLGVBQVM7QUFEWCxLQUZjLEVBS2RKLElBTGMsQ0FBaEI7QUFPQSxVQUFLSCxNQUFMLElBQWVJLFFBQVFMLEtBQVIsSUFBaUJBLE1BQU1TLE1BQU4sQ0FBYUosT0FBYixDQUFoQztBQVRxQjtBQVV0Qjs7Ozt5QkFFSUEsTyxFQUFTO0FBQ1osYUFBTyxLQUFLSixNQUFMLEVBQWFJLE9BQWIsQ0FBUDtB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YStDLE1BQWIsT0FBd0J0QyxFQUFFTSxLQUExQixTQUFtQ1EsRUFBbkMsRUFDTlgsSUFETSxDQUNELFVBQUNhLFFBQUQsRUFBYztBQUNsQixlQUFPQSxTQUFTTCxJQUFoQjtBQUNELE9BSE0sQ0FBUDtBQUlEOzs7MEJBRUs0QixDLEVBQUc7QUFDUCxhQUFPLEtBQUtoRCxNQUFMLEVBQWF3QixHQUFiLE9BQXFCd0IsRUFBRWxCLElBQXZCLEVBQStCLEVBQUVtQixRQUFRRCxFQUFFRSxLQUFaLEVBQS9CLEVBQ050QyxJQURNLENBQ0QsVUFBQ2EsUUFBRCxFQUFjO0FBQ2xCLGVBQU9BLFNBQVNMLElBQWhCO0FBQ0QsT0FITSxDQUFQO0FBSUQiLCJmaWxlIjoicmVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IFN0b3JhZ2UgfSBmcm9tICdwbHVtcCc7XG5cbmNvbnN0ICRheGlvcyA9IFN5bWJvbCgnJGF4aW9zJyk7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICdibHVlYmlyZCc7XG5cbmV4cG9ydCBjbGFzcyBSZXN0U3RvcmUgZXh0ZW5kcyBTdG9yYWdlIHtcblxuICBjb25zdHJ1Y3RvcihvcHRzID0ge30pIHtcbiAgICBzdXBlcihvcHRzKTtcbiAgICBjb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBiYXNlVVJMOiAnaHR0cDovL2xvY2FsaG9zdC9hcGknLFxuICAgICAgfSxcbiAgICAgIG9wdHNcbiAgICApO1xuICAgIHRoaXNbJGF4aW9zXSA9IG9wdGlvbnMuYXhpb3MgfHwgYXhpb3MuY3JlYXRlKG9wdGlvbnMpO1xuICB9XG5cbiAgcmVzdChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXNbJGF4aW9zXShvcHRpb25zKTtcbiAgfVxuXG4gIHdyaXRlKHQsIHYpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICBpZiAodlt0LiRpZF0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5wYXRjaChgLyR7dC4kbmFtZX0vJHt2W3QuJGlkXX1gLCB2KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50ZXJtaW5hbCkge1xuICAgICAgICByZXR1cm4gdGhpc1skYXhpb3NdLnBvc3QoYC8ke3QuJG5hbWV9YCwgdik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjcmVhdGUgbmV3IGNvbnRlbnQgaW4gYSBub24tdGVybWluYWwgc3RvcmUnKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC50aGVuKChkKSA9PiBkLmRhdGFbdC4kbmFtZV1bMF0pXG4gICAgLnRoZW4oKHJlc3VsdCkgPT4gdGhpcy5ub3RpZnlVcGRhdGUodCwgcmVzdWx0W3QuJGlkXSwgcmVzdWx0KS50aGVuKCgpID0+IHJlc3VsdCkpO1xuICB9XG5cbiAgcmVhZE9uZSh0LCBpZCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIC50aGVuKCgpID0+IHRoaXNbJGF4aW9zXS5nZXQoYC8ke3QuJG5hbWV9LyR7aWR9YCkpXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVt0LiRuYW1lXVswXTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlYWRNYW55KHQsIGlkLCByZWxhdGlvbnNoaXApIHtcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLmdldChgLyR7dC4kbmFtZX0vJHtpZH0vJHtyZWxhdGlvbnNoaXB9YClcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmRhdGEpXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFkZCh0eXBlLCBpZCwgcmVsYXRpb25zaGlwVGl0bGUsIGNoaWxkSWQsIGV4dHJhcykge1xuICAgIGNvbnN0IHJlbGF0aW9uc2hpcEJsb2NrID0gdHlwZS4kZmllbGRzW3JlbGF0aW9uc2hpcFRpdGxlXTtcbiAgICBjb25zdCBzaWRlSW5mbyA9IHJlbGF0aW9uc2hpcEJsb2NrLnJlbGF0aW9uc2hpcC4kc2lkZXNbcmVsYXRpb25zaGlwVGl0bGVdO1xuICAgIGNvbnN0IG5ld0ZpZWxkID0geyBbc2lkZUluZm8uc2VsZi5maWVsZF06IGlkLCBbc2lkZUluZm8ub3RoZXIuZmllbGRdOiBjaGlsZElkIH07XG4gICAgaWYgKHJlbGF0aW9uc2hpcEJsb2NrLnJlbGF0aW9uc2hpcC4kZXh0cmFzKSB7XG4gICAgICBPYmplY3Qua2V5cyhyZWxhdGlvbnNoaXBCbG9jay5yZWxhdGlvbnNoaXAuJGV4dHJhcykuZm9yRWFjaCgoZXh0cmEpID0+IHtcbiAgICAgICAgbmV3RmllbGRbZXh0cmFdID0gZXh0cmFzW2V4dHJhXTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLnB1dChgLyR7dHlwZS4kbmFtZX0vJHtpZH0vJHtyZWxhdGlvbnNoaXBUaXRsZX1gLCBuZXdGaWVsZClcbiAgICAudGhlbigoKSA9PiB0aGlzLm5vdGlmeVVwZGF0ZSh0eXBlLCBpZCwgbnVsbCwgcmVsYXRpb25zaGlwVGl0bGUpKTtcbiAgfVxuXG4gIHJlbW92ZSh0LCBpZCwgcmVsYXRpb25zaGlwVGl0bGUsIGNoaWxkSWQpIHtcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLmRlbGV0ZShgLyR7dC4kbmFtZX0vJHtpZH0vJHtyZWxhdGlvbnNoaXBUaXRsZX0vJHtjaGlsZElkfWApXG4gICAgLnRoZW4oKCkgPT4gdGhpcy5ub3RpZnlVcGRhdGUodCwgaWQsIG51bGwsIHJlbGF0aW9uc2hpcFRpdGxlKSk7XG4gIH1cblxuICBtb2RpZnlSZWxhdGlvbnNoaXAodCwgaWQsIHJlbGF0aW9uc2hpcFRpdGxlLCBjaGlsZElkLCBleHRyYXMpIHtcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLnBhdGNoKGAvJHt0LiRuYW1lfS8ke2lkfS8ke3JlbGF0aW9uc2hpcFRpdGxlfS8ke2NoaWxkSWR9YCwgZXh0cmFzKVxuICAgIC50aGVuKCgpID0+IHRoaXMubm90aWZ5VXBkYXRlKHQsIGlkLCBudWxsLCByZWxhdGlvbnNoaXBUaXRsZSkpO1xuICB9XG5cbiAgZGVsZXRlKHQsIGlkKSB7XG4gICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5kZWxldGUoYC8ke3QuJG5hbWV9LyR7aWR9YClcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgcXVlcnkocSkge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10uZ2V0KGAvJHtxLnR5cGV9YCwgeyBwYXJhbXM6IHEucXVlcnkgfSlcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
