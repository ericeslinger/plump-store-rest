'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RestStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

var _bluebird = require('bluebird');

var Bluebird = _interopRequireWildcard(_bluebird);

var _mergeOptions = require('merge-options');

var _mergeOptions2 = _interopRequireDefault(_mergeOptions);

var _plump = require('plump');

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

    var options = Object.assign({}, { baseURL: 'http://localhost/api', schemata: [] }, opts);
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

      return this.writeAttributes(t, v).then(function (attrResponse) {
        var updated = attrResponse.data;
        if (v.relationships) {
          var relNames = Object.keys(v.relationships);
          return Bluebird.all(relNames.map(function (relName) {
            return _this2.writeRelationship(t, v, relName);
          })).then(function (responses) {
            return responses.reduce(function (acc, curr, idx) {
              return (0, _mergeOptions2.default)(acc, { relationships: _defineProperty({}, relNames[idx], [curr]) });
            }, updated);
          });
        } else {
          return updated;
        }
        // TODO: cache written data
        // }).then(data => {
        //   return this.notifyUpdate(t, data.id, data).then(() => data);
      }).catch(function (err) {
        throw err;
      });
    }
  }, {
    key: 'writeAttributes',
    value: function writeAttributes(type, value) {
      if (value.id) {
        return this[$axios].patch('/' + type.$name + '/' + value.id, value);
      } else if (this.terminal) {
        return this[$axios].post('/' + type.$name, value);
      } else {
        throw new Error('Cannot create new content in a non-terminal store');
      }
    }

    // TODO: Reduce the relationship deltas into
    // a list of things that can be resolved in parallel, then Bluebird.all them

  }, {
    key: 'writeRelationship',
    value: function writeRelationship(type, value, relationship) {
      var _this3 = this;

      var selfRoute = '/' + type.$name + '/' + value.id;
      return value.relationships[relationship].reduce(function (thenable, curr) {
        return thenable.then(function () {
          if (curr.op === 'add') {
            return _this3[$axios].put(selfRoute + '/' + relationship, curr.data);
          } else if (curr.op === 'modify') {
            // TODO: maybe redesign relationship deltas to make id top-level and 'data' into 'meta'
            return _this3[$axios].patch(selfRoute + '/' + relationship + '/' + curr.data.id, curr);
          } else if (curr.op === 'remove') {
            return _this3[$axios].delete(selfRoute + '/' + relationship + '/' + curr.data.id);
          } else {
            throw new Error('Unknown relationship delta op: ' + curr.op);
          }
        }).catch(function (err) {
          return console.log(err);
        });
      }, Bluebird.resolve());
    }
  }, {
    key: 'read',
    value: function read(t, id, opts) {
      var keys = opts && !Array.isArray(opts) ? [opts] : opts;
      return this[$axios].get('/' + t.$name + '/' + id).then(function (response) {
        var result = response.data;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = result.included[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _item = _step.value;

            // TODO: cache included data
            console.log('INCLUDED:', _item.type, _item.id);
          }
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

        var item = result.data;
        var retVal = { type: item.type, id: item.id, attributes: item.attributes };
        if (keys) {
          retVal.relationships = {};
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var key = _step2.value;

              if (key in item.relationships) {
                retVal.relationships[key] = item.relationships[key];
              }
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
        } else {
          retVal.relationships = item.relationships;
        }
        return retVal;
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
    key: 'readRelationships',
    value: function readRelationships(t, id, relationships) {
      var keys = Array.isArray(relationships) ? relationships : [relationships];
      return this.read(t, id).then(function (item) {
        if (item) {
          var retVal = {};
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var key = _step3.value;

              retVal[key] = item.relationships[key];
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          return retVal;
        } else {
          return null;
        }
      }).catch(function (err) {
        throw err;
      });
    }
  }, {
    key: 'readRelationship',
    value: function readRelationship(t, id, relationship) {
      return this.readRelationships(t, id, relationship);
    }
  }, {
    key: 'add',
    value: function add(type, id, relationshipTitle, childId, extras) {
      var _this4 = this;

      var relationshipBlock = type.$schema.relationships[relationshipTitle].type;
      var newField = { id: childId };
      if (relationshipBlock.$extras) {
        for (var extra in extras) {
          if (extra in relationshipBlock.$extras) {
            newField.meta = newField.meta || {};
            newField.meta[extra] = extras[extra];
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3QuanMiXSwibmFtZXMiOlsiYXhpb3MiLCJCbHVlYmlyZCIsIiRheGlvcyIsIlN5bWJvbCIsIlJlc3RTdG9yZSIsIm9wdHMiLCJvcHRpb25zIiwiT2JqZWN0IiwiYXNzaWduIiwiYmFzZVVSTCIsInNjaGVtYXRhIiwiY3JlYXRlIiwidCIsInYiLCJ3cml0ZUF0dHJpYnV0ZXMiLCJ0aGVuIiwidXBkYXRlZCIsImF0dHJSZXNwb25zZSIsImRhdGEiLCJyZWxhdGlvbnNoaXBzIiwicmVsTmFtZXMiLCJrZXlzIiwiYWxsIiwibWFwIiwid3JpdGVSZWxhdGlvbnNoaXAiLCJyZWxOYW1lIiwicmVzcG9uc2VzIiwicmVkdWNlIiwiYWNjIiwiY3VyciIsImlkeCIsImNhdGNoIiwiZXJyIiwidHlwZSIsInZhbHVlIiwiaWQiLCJwYXRjaCIsIiRuYW1lIiwidGVybWluYWwiLCJwb3N0IiwiRXJyb3IiLCJyZWxhdGlvbnNoaXAiLCJzZWxmUm91dGUiLCJ0aGVuYWJsZSIsIm9wIiwicHV0IiwiZGVsZXRlIiwiY29uc29sZSIsImxvZyIsInJlc29sdmUiLCJBcnJheSIsImlzQXJyYXkiLCJnZXQiLCJyZXN1bHQiLCJyZXNwb25zZSIsImluY2x1ZGVkIiwiaXRlbSIsInJldFZhbCIsImF0dHJpYnV0ZXMiLCJrZXkiLCJzdGF0dXMiLCJyZWFkIiwicmVhZFJlbGF0aW9uc2hpcHMiLCJyZWxhdGlvbnNoaXBUaXRsZSIsImNoaWxkSWQiLCJleHRyYXMiLCJyZWxhdGlvbnNoaXBCbG9jayIsIiRzY2hlbWEiLCJuZXdGaWVsZCIsIiRleHRyYXMiLCJleHRyYSIsIm1ldGEiLCJub3RpZnlVcGRhdGUiLCJxIiwicGFyYW1zIiwicXVlcnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOztJQUFZQSxLOztBQUNaOztJQUFZQyxROztBQUNaOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUMsU0FBU0MsT0FBTyxRQUFQLENBQWY7O0lBRWFDLFMsV0FBQUEsUzs7O0FBQ1gs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YUFBTyxLQUFLakMsTUFBTCxFQUFhNEMsTUFBYixPQUF3QmxDLEVBQUV5QixLQUExQixTQUFtQ0YsRUFBbkMsRUFDTnBCLElBRE0sQ0FDRCxvQkFBWTtBQUNoQixlQUFPdUMsU0FBU3BDLElBQVQsQ0FBY0EsSUFBckI7QUFDRCxPQUhNLENBQVA7QUFJRDs7OzBCQUVLdUQsQyxFQUFHO0FBQ1AsYUFBTyxLQUFLdkUsTUFBTCxFQUFha0QsR0FBYixPQUFxQnFCLEVBQUV4QyxJQUF2QixFQUErQixFQUFFeUMsUUFBUUQsRUFBRUUsS0FBWixFQUEvQixFQUNONUQsSUFETSxDQUNELG9CQUFZO0FBQ2hCLGVBQU91QyxTQUFTcEMsSUFBVCxDQUFjQSxJQUFyQjtBQUNELE9BSE0sQ0FBUDtBQUlEIiwiZmlsZSI6InJlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgKiBhcyBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuaW1wb3J0IHsgU3RvcmFnZSB9IGZyb20gJ3BsdW1wJztcblxuY29uc3QgJGF4aW9zID0gU3ltYm9sKCckYXhpb3MnKTtcblxuZXhwb3J0IGNsYXNzIFJlc3RTdG9yZSBleHRlbmRzIFN0b3JhZ2Uge1xuICBjb25zdHJ1Y3RvcihvcHRzID0ge30pIHtcbiAgICBzdXBlcihvcHRzKTtcbiAgICBjb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LFxuICAgICAgeyBiYXNlVVJMOiAnaHR0cDovL2xvY2FsaG9zdC9hcGknLCBzY2hlbWF0YTogW10gfSxcbiAgICAgIG9wdHNcbiAgICApO1xuICAgIHRoaXNbJGF4aW9zXSA9IG9wdGlvbnMuYXhpb3MgfHwgYXhpb3MuY3JlYXRlKG9wdGlvbnMpO1xuICB9XG5cbiAgcmVzdChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXNbJGF4aW9zXShvcHRpb25zKTtcbiAgfVxuXG4gIHdyaXRlKHQsIHYpIHtcbiAgICByZXR1cm4gdGhpcy53cml0ZUF0dHJpYnV0ZXModCwgdikudGhlbihhdHRyUmVzcG9uc2UgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZCA9IGF0dHJSZXNwb25zZS5kYXRhO1xuICAgICAgaWYgKHYucmVsYXRpb25zaGlwcykge1xuICAgICAgICBjb25zdCByZWxOYW1lcyA9IE9iamVjdC5rZXlzKHYucmVsYXRpb25zaGlwcyk7XG4gICAgICAgIHJldHVybiBCbHVlYmlyZC5hbGwoXG4gICAgICAgICAgcmVsTmFtZXMubWFwKHJlbE5hbWUgPT4gdGhpcy53cml0ZVJlbGF0aW9uc2hpcCh0LCB2LCByZWxOYW1lKSlcbiAgICAgICAgKS50aGVuKHJlc3BvbnNlcyA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlcy5yZWR1Y2UoKGFjYywgY3VyciwgaWR4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VPcHRpb25zKGFjYywgeyByZWxhdGlvbnNoaXBzOiB7IFtyZWxOYW1lc1tpZHhdXTogW2N1cnJdIH0gfSk7XG4gICAgICAgICAgfSwgdXBkYXRlZCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHVwZGF0ZWQ7XG4gICAgICB9XG4gICAgLy8gVE9ETzogY2FjaGUgd3JpdHRlbiBkYXRhXG4gICAgLy8gfSkudGhlbihkYXRhID0+IHtcbiAgICAvLyAgIHJldHVybiB0aGlzLm5vdGlmeVVwZGF0ZSh0LCBkYXRhLmlkLCBkYXRhKS50aGVuKCgpID0+IGRhdGEpO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG4gIH1cblxuICB3cml0ZUF0dHJpYnV0ZXModHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUuaWQpIHtcbiAgICAgIHJldHVybiB0aGlzWyRheGlvc10ucGF0Y2goYC8ke3R5cGUuJG5hbWV9LyR7dmFsdWUuaWR9YCwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAodGhpcy50ZXJtaW5hbCkge1xuICAgICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5wb3N0KGAvJHt0eXBlLiRuYW1lfWAsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY3JlYXRlIG5ldyBjb250ZW50IGluIGEgbm9uLXRlcm1pbmFsIHN0b3JlJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETzogUmVkdWNlIHRoZSByZWxhdGlvbnNoaXAgZGVsdGFzIGludG9cbiAgLy8gYSBsaXN0IG9mIHRoaW5ncyB0aGF0IGNhbiBiZSByZXNvbHZlZCBpbiBwYXJhbGxlbCwgdGhlbiBCbHVlYmlyZC5hbGwgdGhlbVxuICB3cml0ZVJlbGF0aW9uc2hpcCh0eXBlLCB2YWx1ZSwgcmVsYXRpb25zaGlwKSB7XG4gICAgY29uc3Qgc2VsZlJvdXRlID0gYC8ke3R5cGUuJG5hbWV9LyR7dmFsdWUuaWR9YDtcbiAgICByZXR1cm4gdmFsdWUucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBdXG4gICAgICAucmVkdWNlKCh0aGVuYWJsZSwgY3VycikgPT4ge1xuICAgICAgICByZXR1cm4gdGhlbmFibGUudGhlbigoKSA9PiB7XG4gICAgICAgICAgaWYgKGN1cnIub3AgPT09ICdhZGQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1skYXhpb3NdLnB1dChgJHtzZWxmUm91dGV9LyR7cmVsYXRpb25zaGlwfWAsIGN1cnIuZGF0YSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjdXJyLm9wID09PSAnbW9kaWZ5Jykge1xuICAgICAgICAgICAgLy8gVE9ETzogbWF5YmUgcmVkZXNpZ24gcmVsYXRpb25zaGlwIGRlbHRhcyB0byBtYWtlIGlkIHRvcC1sZXZlbCBhbmQgJ2RhdGEnIGludG8gJ21ldGEnXG4gICAgICAgICAgICByZXR1cm4gdGhpc1skYXhpb3NdLnBhdGNoKGAke3NlbGZSb3V0ZX0vJHtyZWxhdGlvbnNoaXB9LyR7Y3Vyci5kYXRhLmlkfWAsIGN1cnIpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY3Vyci5vcCA9PT0gJ3JlbW92ZScpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzWyRheGlvc10uZGVsZXRlKGAke3NlbGZSb3V0ZX0vJHtyZWxhdGlvbnNoaXB9LyR7Y3Vyci5kYXRhLmlkfWApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcmVsYXRpb25zaGlwIGRlbHRhIG9wOiAke2N1cnIub3B9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XG4gICAgICB9LCBCbHVlYmlyZC5yZXNvbHZlKCkpO1xuICB9XG5cbiAgcmVhZCh0LCBpZCwgb3B0cykge1xuICAgIGNvbnN0IGtleXMgPSBvcHRzICYmICFBcnJheS5pc0FycmF5KG9wdHMpID8gW29wdHNdIDogb3B0cztcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLmdldChgLyR7dC4kbmFtZX0vJHtpZH1gKVxuICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcmVzdWx0LmluY2x1ZGVkKSB7XG4gICAgICAgIC8vIFRPRE86IGNhY2hlIGluY2x1ZGVkIGRhdGFcbiAgICAgICAgY29uc29sZS5sb2coJ0lOQ0xVREVEOicsIGl0ZW0udHlwZSwgaXRlbS5pZCk7XG4gICAgICB9XG4gICAgICBjb25zdCBpdGVtID0gcmVzdWx0LmRhdGE7XG4gICAgICBjb25zdCByZXRWYWwgPSB7IHR5cGU6IGl0ZW0udHlwZSwgaWQ6IGl0ZW0uaWQsIGF0dHJpYnV0ZXM6IGl0ZW0uYXR0cmlidXRlcyB9O1xuICAgICAgaWYgKGtleXMpIHtcbiAgICAgICAgcmV0VmFsLnJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgICAgIGlmIChrZXkgaW4gaXRlbS5yZWxhdGlvbnNoaXBzKSB7XG4gICAgICAgICAgICByZXRWYWwucmVsYXRpb25zaGlwc1trZXldID0gaXRlbS5yZWxhdGlvbnNoaXBzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXRWYWwucmVsYXRpb25zaGlwcyA9IGl0ZW0ucmVsYXRpb25zaGlwcztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXRWYWw7XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVhZEF0dHJpYnV0ZXModCwgaWQpIHtcbiAgICByZXR1cm4gdGhpcy5yZWFkKHQsIGlkKVxuICAgIC50aGVuKGl0ZW0gPT4gaXRlbSA/IGl0ZW0uYXR0cmlidXRlcyA6IG51bGwpXG4gICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG4gIH1cblxuICByZWFkUmVsYXRpb25zaGlwcyh0LCBpZCwgcmVsYXRpb25zaGlwcykge1xuICAgIGNvbnN0IGtleXMgPSBBcnJheS5pc0FycmF5KHJlbGF0aW9uc2hpcHMpID8gcmVsYXRpb25zaGlwcyA6IFtyZWxhdGlvbnNoaXBzXTtcbiAgICByZXR1cm4gdGhpcy5yZWFkKHQsIGlkKVxuICAgIC50aGVuKGl0ZW0gPT4ge1xuICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgY29uc3QgcmV0VmFsID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgICAgICByZXRWYWxba2V5XSA9IGl0ZW0ucmVsYXRpb25zaGlwc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXRWYWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH0pO1xuICB9XG5cbiAgcmVhZFJlbGF0aW9uc2hpcCh0LCBpZCwgcmVsYXRpb25zaGlwKSB7XG4gICAgcmV0dXJuIHRoaXMucmVhZFJlbGF0aW9uc2hpcHModCwgaWQsIHJlbGF0aW9uc2hpcCk7XG4gIH1cblxuICBhZGQodHlwZSwgaWQsIHJlbGF0aW9uc2hpcFRpdGxlLCBjaGlsZElkLCBleHRyYXMpIHtcbiAgICBjb25zdCByZWxhdGlvbnNoaXBCbG9jayA9IHR5cGUuJHNjaGVtYS5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcFRpdGxlXS50eXBlO1xuICAgIGNvbnN0IG5ld0ZpZWxkID0geyBpZDogY2hpbGRJZCB9O1xuICAgIGlmIChyZWxhdGlvbnNoaXBCbG9jay4kZXh0cmFzKSB7XG4gICAgICBmb3IgKGNvbnN0IGV4dHJhIGluIGV4dHJhcykge1xuICAgICAgICBpZiAoZXh0cmEgaW4gcmVsYXRpb25zaGlwQmxvY2suJGV4dHJhcykge1xuICAgICAgICAgIG5ld0ZpZWxkLm1ldGEgPSBuZXdGaWVsZC5tZXRhIHx8IHt9O1xuICAgICAgICAgIG5ld0ZpZWxkLm1ldGFbZXh0cmFdID0gZXh0cmFzW2V4dHJhXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLnB1dChgLyR7dHlwZS4kbmFtZX0vJHtpZH0vJHtyZWxhdGlvbnNoaXBUaXRsZX1gLCBuZXdGaWVsZClcbiAgICAudGhlbigoKSA9PiB0aGlzLm5vdGlmeVVwZGF0ZSh0eXBlLCBpZCwgbnVsbCwgcmVsYXRpb25zaGlwVGl0bGUpKTtcbiAgfVxuXG4gIHJlbW92ZSh0LCBpZCwgcmVsYXRpb25zaGlwVGl0bGUsIGNoaWxkSWQpIHtcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLmRlbGV0ZShgLyR7dC4kbmFtZX0vJHtpZH0vJHtyZWxhdGlvbnNoaXBUaXRsZX0vJHtjaGlsZElkfWApXG4gICAgLnRoZW4oKCkgPT4gdGhpcy5ub3RpZnlVcGRhdGUodCwgaWQsIG51bGwsIHJlbGF0aW9uc2hpcFRpdGxlKSk7XG4gIH1cblxuICBtb2RpZnlSZWxhdGlvbnNoaXAodCwgaWQsIHJlbGF0aW9uc2hpcFRpdGxlLCBjaGlsZElkLCBleHRyYXMpIHtcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLnBhdGNoKGAvJHt0LiRuYW1lfS8ke2lkfS8ke3JlbGF0aW9uc2hpcFRpdGxlfS8ke2NoaWxkSWR9YCwgZXh0cmFzKVxuICAgIC50aGVuKCgpID0+IHRoaXMubm90aWZ5VXBkYXRlKHQsIGlkLCBudWxsLCByZWxhdGlvbnNoaXBUaXRsZSkpO1xuICB9XG5cbiAgZGVsZXRlKHQsIGlkKSB7XG4gICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5kZWxldGUoYC8ke3QuJG5hbWV9LyR7aWR9YClcbiAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5kYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgcXVlcnkocSkge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10uZ2V0KGAvJHtxLnR5cGV9YCwgeyBwYXJhbXM6IHEucXVlcnkgfSlcbiAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5kYXRhO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
