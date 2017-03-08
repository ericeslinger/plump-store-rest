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
    value: function read(t, id, opts) {
      var _this3 = this;

      var keys = opts && !Array.isArray(opts) ? [opts] : opts;
      return this[$axios].get('/' + t.$name + '/' + id).then(function (response) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = response.included[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _item = _step2.value;

            var schema = _this3[$schemata][_item.type];
            var fields = ['attributes'].concat(Object.keys(_item.relationships));
            if (!schema) {
              console.warn('RestStore received unknown type \'' + _item.type + '\' in HTTP response');
            }
            _this3.notifyUpdate(schema, _item.id, _item, fields);
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

        var item = response.data;
        var retVal = { type: item.type, id: item.id, attributes: item.attributes };
        if (keys) {
          retVal.relationships = {};
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var key = _step3.value;

              if (key in item.relationships) {
                retVal.relationships[key] = item.relationships[key];
              }
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
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = keys[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var key = _step4.value;

              retVal[key] = item.relationships[key];
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          return retVal;
        } else {
          return null;
        }
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3QuanMiXSwibmFtZXMiOlsiYXhpb3MiLCIkYXhpb3MiLCJTeW1ib2wiLCIkc2NoZW1hdGEiLCJSZXN0U3RvcmUiLCJvcHRzIiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsImJhc2VVUkwiLCJzY2hlbWF0YSIsImNyZWF0ZSIsInNjaGVtYSIsImFkZFNjaGVtYSIsIiRuYW1lIiwiRXJyb3IiLCJ0IiwidiIsInJlc29sdmUiLCJ0aGVuIiwiJGlkIiwicGF0Y2giLCJ0ZXJtaW5hbCIsInBvc3QiLCJkYXRhIiwicmVzcG9uc2UiLCJub3RpZnlVcGRhdGUiLCJpZCIsImtleXMiLCJBcnJheSIsImlzQXJyYXkiLCJnZXQiLCJpbmNsdWRlZCIsIml0ZW0iLCJ0eXBlIiwiZmllbGRzIiwiY29uY2F0IiwicmVsYXRpb25zaGlwcyIsImNvbnNvbGUiLCJ3YXJuIiwicmV0VmFsIiwiYXR0cmlidXRlcyIsImtleSIsImNhdGNoIiwiZXJyIiwic3RhdHVzIiwicmVhZCIsInJlbGF0aW9uc2hpcCIsInJlYWRSZWxhdGlvbnNoaXBzIiwicmVsYXRpb25zaGlwVGl0bGUiLCJjaGlsZElkIiwiZXh0cmFzIiwicmVsYXRpb25zaGlwQmxvY2siLCIkc2NoZW1hIiwibmV3RmllbGQiLCIkZXh0cmFzIiwiZXh0cmEiLCJtZXRhIiwicHV0IiwiZGVsZXRlIiwicSIsInBhcmFtcyIsInF1ZXJ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7SUFBWUEsSzs7QUFDWjs7QUFJQTs7Ozs7Ozs7Ozs7Ozs7QUFGQSxJQUFNQyxTQUFTQyxPQUFPLFFBQVAsQ0FBZjtBQUNBLElBQU1DLFlBQVlELE9BQU8sV0FBUCxDQUFsQjs7SUFHYUUsUyxXQUFBQSxTOzs7QUFDWCx1QkFBdUI7QUFBQSxRQUFYQyxJQUFXLHVFQUFKLEVBQUk7O0FBQUE7O0FBQUEsc0hBQ2ZBLElBRGU7O0FBRXJCLFFBQU1DLFVBQVVDLE9BQU9DLE1BQVAsQ0FDZCxFQURjLEVBRWQsRUFBRUMsU0FBUyxzQkFBWCxFQUFtQ0MsVUFBVSxFQUE3QyxFQUZjLEVBR2RMLElBSGMsQ0FBaEI7QUFLQSxVQUFLSixNQUFMLElBQWVLLFFBQVFOLEtBQVIsSUFBaUJBLE1BQU1XLE1BQU4sQ0FBYUwsT0FBYixDQUFoQztBQUNBLFVBQUtILFNBQUwsSUFBa0IsRUFBbEI7QUFScUI7QUFBQTtBQUFBOztBQUFBO0FBU3JCLDJCQUFxQkcsUUFBUUksUUFBN0IsOEhBQXVDO0FBQUEsWUFBNUJFLE1BQTRCOztBQUNyQyxjQUFLQyxTQUFMLENBQWVELE1BQWY7QUFDRDtBQUNEO0FBWnFCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFhdEI7Ozs7OEJBRVNBLE0sRUFBUTtBQUNoQixVQUFJLEtBQUtULFNBQUwsRUFBZ0JTLE9BQU9FLEtBQXZCLENBQUosRUFBbUM7QUFDakMsY0FBTSxJQUFJQyxLQUFKLDZDQUFvREgsT0FBT0UsS0FBM0QsQ0FBTjtBQUNELE9BRkQsTUFFTztBQUNMLGFBQUtYLFNBQUwsRUFBZ0JTLE9BQU9FLEtBQXZCLElBQWdDRixNQUFoQztBQUNEO0FBQ0Y7Ozt5QkFFSU4sTyxFQUFTO0FBQ1osYUFBTyxLQUFLTCxNQUFMLEVBQWFLLE9BQWIsQ0FBUDtBQUNEOzs7MEJBRUtVLEMsRUFBR0MsQyxFQUFHO0FBQUE7O0FBQ1YsYUFBTyxtQkFBUUMsT0FBUixHQUNOQyxJQURNLENBQ0QsWUFBTTtBQUNWLFlBQUlGLEVBQUVELEVBQUVJLEdBQUosQ0FBSixFQUFjO0FBQ1osaUJBQU8sT0FBS25CLE1BQUwsRUFBYW9CLEtBQWIsT0FBdUJMLEVBQUVGLEtBQXpCLFNBQWtDRyxFQUFFRCxFQUFFSSxHQUFKLENBQWxDLEVBQThDSCxDQUE5QyxDQUFQO0FBQ0QsU0FGRCxNQUVPLElBQUksT0FBS0ssUUFBVCxFQUFtQjtBQUN4QixpQkFBTyxPQUFLckIsTUFBTCxFQUFhc0IsSUFBYixPQUFzQlAsRUFBRUYsS0FBeEIsRUFBaUNHLENBQWpDLENBQVA7QUFDRCxTQUZNLE1BRUE7QUFDTCxnQkFBTSxJQUFJRixLQUFKLENBQVUsbURBQVYsQ0FBTjtBQUNEO0FBQ0YsT0FUTSxFQVVOSSxJQVZNLENBVUQsb0JBQVk7QUFDaEIsWUFBTUssT0FBT0MsU0FBU0QsSUFBdEI7QUFDQSxlQUFPLE9BQUtFLFlBQUwsQ0FBa0JWLENBQWxCLEVBQXFCUSxLQUFLRyxFQUExQixFQUE4QkgsSUFBOUIsRUFBb0NMLElBQXBDLENBQXlDO0FBQUEsaUJBQU1LLElBQU47QUFBQSxTQUF6QyxDQUFQO0FBQ0QsT0FiTSxDQUFQO0FBY0Q7Ozt5QkFFSVIsQyxFQUFHVyxFLEVBQUl0QixJLEVBQU07QUFBQTs7QUFDaEIsVUFBTXVCLE9BQU92QixRQUFRLENBQUN3QixNQUFNQyxPQUFOLENBQWN6QixJQUFkLENBQVQsR0FBK0IsQ0FBQ0EsSUFBRCxDQUEvQixHQUF3Q0EsSUFBckQ7QUFDQSxhQUFPLEtBQUtKLE1BQUwsRUFBYThCLEdBQWIsT0FBcUJmLEVBQUVGLEtBQXZCLFNBQWdDYSxFQUFoQyxFQUNOUixJQURNLENBQ0Qsb0JBQVk7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDaEIsZ0NBQW1CTSxTQUFTTyxRQUE1QixtSUFBc0M7QUFBQSxnQkFBM0JDLEtBQTJCOztBQUNwQyxnQkFBTXJCLFNBQVMsT0FBS1QsU0FBTCxFQUFnQjhCLE1BQUtDLElBQXJCLENBQWY7QUFDQSxnQkFBTUMsU0FBUyxDQUFDLFlBQUQsRUFBZUMsTUFBZixDQUFzQjdCLE9BQU9xQixJQUFQLENBQVlLLE1BQUtJLGFBQWpCLENBQXRCLENBQWY7QUFDQSxnQkFBSSxDQUFDekIsTUFBTCxFQUFhO0FBQ1gwQixzQkFBUUMsSUFBUix3Q0FBaUROLE1BQUtDLElBQXREO0FBQ0Q7QUFDRCxtQkFBS1IsWUFBTCxDQUFrQmQsTUFBbEIsRUFBMEJxQixNQUFLTixFQUEvQixFQUFtQ00sS0FBbkMsRUFBeUNFLE1BQXpDO0FBQ0Q7QUFSZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVNoQixZQUFNRixPQUFPUixTQUFTRCxJQUF0QjtBQUNBLFlBQU1nQixTQUFTLEVBQUVOLE1BQU1ELEtBQUtDLElBQWIsRUFBbUJQLElBQUlNLEtBQUtOLEVBQTVCLEVBQWdDYyxZQUFZUixLQUFLUSxVQUFqRCxFQUFmO0FBQ0EsWUFBSWIsSUFBSixFQUFVO0FBQ1JZLGlCQUFPSCxhQUFQLEdBQXVCLEVBQXZCO0FBRFE7QUFBQTtBQUFBOztBQUFBO0FBRVIsa0NBQWtCVCxJQUFsQixtSUFBd0I7QUFBQSxrQkFBYmMsR0FBYTs7QUFDdEIsa0JBQUlBLE9BQU9ULEtBQUtJLGFBQWhCLEVBQStCO0FBQzdCRyx1QkFBT0gsYUFBUCxDQUFxQkssR0FBckIsSUFBNEJULEtBQUtJLGFBQUwsQ0FBbUJLLEdBQW5CLENBQTVCO0FBQ0Q7QUFDRjtBQU5PO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFPVCxTQVBELE1BT087QUFDTEYsaUJBQU9ILGFBQVAsR0FBdUJKLEtBQUtJLGFBQTVCO0FBQ0Q7QUFDRCxlQUFPRyxNQUFQO0FBQ0QsT0F2Qk0sRUF1QkpHLEtBdkJJLENBdUJFLGVBQU87QUFDZCxZQUFJQyxJQUFJbkIsUUFBSixJQUFnQm1CLElBQUluQixRQUFKLENBQWFvQixNQUFiLEtBQXdCLEdBQTVDLEVBQWlEO0FBQy9DLGlCQUFPLElBQVA7QUFDRCxTQUZELE1BRU87QUFDTCxnQkFBTUQsR0FBTjtBQUNEO0FBQ0YsT0E3Qk0sQ0FBUDtBQThCRDs7O21DQUVjNUIsQyxFQUFHVyxFLEVBQUk7QUFDcEIsYUFBTyxLQUFLbUIsSUFBTCxDQUFVOUIsQ0FBVixFQUFhVyxFQUFiLEVBQ05SLElBRE0sQ0FDRDtBQUFBLGVBQVFjLE9BQU9BLEtBQUtRLFVBQVosR0FBeUIsSUFBakM7QUFBQSxPQURDLEVBRU5FLEtBRk0sQ0FFQSxlQUFPO0FBQ1osY0FBTUMsR0FBTjtBQUNELE9BSk0sQ0FBUDtBQUtEOzs7c0NBRWlCNUIsQyxFQUFHVyxFLEVBQUlVLGEsRUFBZTtBQUN0QyxVQUFNVCxPQUFPQyxNQUFNQyxPQUFOLENBQWNPLGFBQWQsSUFBK0JBLGFBQS9CLEdBQStDLENBQUNBLGFBQUQsQ0FBNUQ7QUFDQSxhQUFPLEtBQUtTLElBQUwsQ0FBVTlCLENBQVYsRUFBYVcsRUFBYixFQUNOUixJQURNLENBQ0QsZ0JBQVE7QUFDWixZQUFJYyxJQUFKLEVBQVU7QUFDUixjQUFNTyxTQUFTLEVBQWY7QUFEUTtBQUFBO0FBQUE7O0FBQUE7QUFFUixrQ0FBa0JaLElBQWxCLG1JQUF3QjtBQUFBLGtCQUFiYyxHQUFhOztBQUN0QkYscUJBQU9FLEdBQVAsSUFBY1QsS0FBS0ksYUFBTCxDQUFtQkssR0FBbkIsQ0FBZDtBQUNEO0FBSk87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFLUixpQkFBT0YsTUFBUDtBQUNELFNBTkQsTUFNTztBQUNMLGlCQUFPLElBQVA7QUFDRDtBQUNGLE9BWE0sQ0FBUDtBQVlEOzs7cUNBRWdCeEIsQyxFQUFHVyxFLEVBQUlvQixZLEVBQWM7QUFDcEMsYUFBTyxLQUFLQyxpQkFBTCxDQUF1QmhDLENBQXZCLEVBQTBCVyxFQUExQixFQUE4Qm9CLFlBQTlCLENBQVA7QUFDRDs7O3dCQUVHYixJLEVBQU1QLEUsRUFBSXNCLGlCLEVBQW1CQyxPLEVBQVNDLE0sRUFBUTtBQUFBOztBQUNoRCxVQUFNQyxvQkFBb0JsQixLQUFLbUIsT0FBTCxDQUFhaEIsYUFBYixDQUEyQlksaUJBQTNCLEVBQThDZixJQUF4RTtBQUNBLFVBQU1vQixXQUFXLEVBQUUzQixJQUFJdUIsT0FBTixFQUFqQjtBQUNBLFVBQUlFLGtCQUFrQkcsT0FBdEIsRUFBK0I7QUFDN0IsYUFBSyxJQUFNQyxLQUFYLElBQW9CTCxNQUFwQixFQUE0QjtBQUMxQixjQUFJSyxTQUFTSixrQkFBa0JHLE9BQS9CLEVBQXdDO0FBQ3RDRCxxQkFBU0csSUFBVCxHQUFnQkgsU0FBU0csSUFBVCxJQUFpQixFQUFqQztBQUNBSCxxQkFBU0csSUFBVCxDQUFjRCxLQUFkLElBQXVCTCxPQUFPSyxLQUFQLENBQXZCO0FBQ0Q7QUFDRjtBQUNGO0FBQ0QsYUFBTyxLQUFLdkQsTUFBTCxFQUFheUQsR0FBYixPQUFxQnhCLEtBQUtwQixLQUExQixTQUFtQ2EsRUFBbkMsU0FBeUNzQixpQkFBekMsRUFBOERLLFFBQTlELEVBQ05uQyxJQURNLENBQ0Q7QUFBQSxlQUFNLE9BQUtPLFlBQUwsQ0FBa0JRLElBQWxCLEVBQXdCUCxFQUF4QixFQUE0QixJQUE1QixFQUFrQ3NCLGlCQUFsQyxDQUFOO0FBQUEsT0FEQyxDQUFQO0FBRUQ7OzsyQkFFTWpDLEMsRUFBR1csRSxFQUFJc0IsaUIsRUFBbUJDLE8sRUFBUztBQUFBOztBQUN4QyxhQUFPLEtBQUtqRCxNQUFMLEVBQWEwRCxNQUFiLE9BQXdCM0MsRUFBRUYsS0FBMUIsU0FBbUNhLEVBQW5DLFNBQXlDc0IsaUJBQXpDLFNBQThEQyxPQUE5RCxFQUNOL0IsSUFETSxDQUNEO0FBQUEsZUFBTSxPQUFLTyxZQUFMLENBQWtCVixDQUFsQixFQUFxQlcsRUFBckIsRUFBeUIsSUFBekIsRUFBK0JzQixpQkFBL0IsQ0FBTjtBQUFBLE9BREMsQ0FBUDtBQUVEOzs7dUNBRWtCakMsQyxFQUFHVyxFLEVBQUlzQixpQixFQUFtQkMsTyxFQUFTQyxNLEVBQVE7QUFBQTs7QUFDNUQsYUFBTyxLQUFLbEQsTUFBTCxFQUFhb0IsS0FBYixPQUF1QkwsRUFBRUYsS0FBekIsU0FBa0NhLEVBQWxDLFNBQXdDc0IsaUJBQXhDLFNBQTZEQyxPQUE3RCxFQUF3RUMsTUFBeEUsRUFDTmhDLElBRE0sQ0FDRDtBQUFBLGVBQU0sT0FBS08sWUFBTCxDQUFrQlYsQ0FBbEIsRUFBcUJXLEVBQXJCLEVBQXlCLElBQXpCLEVBQStCc0IsaUJBQS9CLENBQU47QUFBQSxPQURDLENBQVA7QUFFRDs7OzRCQUVNakMsQyxFQUFHVyxFLEVBQUk7QUFDWixhQUFPLEtBQUsxQixNQUFMLEVBQWEwRCxNQUFiLE9BQXdCM0MsRUFBRUYsS0FBMUIsU0FBbUNhLEVBQW5DLEVBQ05SLElBRE0sQ0FDRCxvQkFBWTtBQUNoQixlQUFPTSxTQUFTRCxJQUFULENBQWNBLElBQXJCO0FBQ0QsT0FITSxDQUFQO0FBSUQ7OzswQkFFS29DLEMsRUFBRztBQUNQLGFBQU8sS0FBSzNELE1BQUwsRUFBYThCLEdBQWIsT0FBcUI2QixFQUFFMUIsSUFBdkIsRUFBK0IsRUFBRTJCLFFBQVFELEVBQUVFLEtBQVosRUFBL0IsRUFDTjNDLElBRE0sQ0FDRCxvQkFBWTtBQUNoQixlQUFPTSxTQUFTRCxJQUFULENBQWNBLElBQXJCO0FBQ0QsT0FITSxDQUFQO0FBSUQiLCJmaWxlIjoicmVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IFN0b3JhZ2UgfSBmcm9tICdwbHVtcCc7XG5cbmNvbnN0ICRheGlvcyA9IFN5bWJvbCgnJGF4aW9zJyk7XG5jb25zdCAkc2NoZW1hdGEgPSBTeW1ib2woJyRzY2hlbWF0YScpO1xuaW1wb3J0IFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuXG5leHBvcnQgY2xhc3MgUmVzdFN0b3JlIGV4dGVuZHMgU3RvcmFnZSB7XG4gIGNvbnN0cnVjdG9yKG9wdHMgPSB7fSkge1xuICAgIHN1cGVyKG9wdHMpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICB7IGJhc2VVUkw6ICdodHRwOi8vbG9jYWxob3N0L2FwaScsIHNjaGVtYXRhOiBbXSB9LFxuICAgICAgb3B0c1xuICAgICk7XG4gICAgdGhpc1skYXhpb3NdID0gb3B0aW9ucy5heGlvcyB8fCBheGlvcy5jcmVhdGUob3B0aW9ucyk7XG4gICAgdGhpc1skc2NoZW1hdGFdID0ge307XG4gICAgZm9yIChjb25zdCBzY2hlbWEgb2Ygb3B0aW9ucy5zY2hlbWF0YSkge1xuICAgICAgdGhpcy5hZGRTY2hlbWEoc2NoZW1hKTtcbiAgICB9XG4gICAgLy8gb3B0aW9ucy5zY2hlbWF0YS5mb3JFYWNoKHRoaXMuYWRkU2NoZW1hKTtcbiAgfVxuXG4gIGFkZFNjaGVtYShzY2hlbWEpIHtcbiAgICBpZiAodGhpc1skc2NoZW1hdGFdW3NjaGVtYS4kbmFtZV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXR0ZW1wdGluZyB0byByZWdpc3RlciBkdXBsaWNhdGUgdHlwZTogJHtzY2hlbWEuJG5hbWV9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbJHNjaGVtYXRhXVtzY2hlbWEuJG5hbWVdID0gc2NoZW1hO1xuICAgIH1cbiAgfVxuXG4gIHJlc3Qob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10ob3B0aW9ucyk7XG4gIH1cblxuICB3cml0ZSh0LCB2KSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHZbdC4kaWRdKSB7XG4gICAgICAgIHJldHVybiB0aGlzWyRheGlvc10ucGF0Y2goYC8ke3QuJG5hbWV9LyR7dlt0LiRpZF19YCwgdik7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudGVybWluYWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5wb3N0KGAvJHt0LiRuYW1lfWAsIHYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY3JlYXRlIG5ldyBjb250ZW50IGluIGEgbm9uLXRlcm1pbmFsIHN0b3JlJyk7XG4gICAgICB9XG4gICAgfSlcbiAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgIHJldHVybiB0aGlzLm5vdGlmeVVwZGF0ZSh0LCBkYXRhLmlkLCBkYXRhKS50aGVuKCgpID0+IGRhdGEpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVhZCh0LCBpZCwgb3B0cykge1xuICAgIGNvbnN0IGtleXMgPSBvcHRzICYmICFBcnJheS5pc0FycmF5KG9wdHMpID8gW29wdHNdIDogb3B0cztcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLmdldChgLyR7dC4kbmFtZX0vJHtpZH1gKVxuICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByZXNwb25zZS5pbmNsdWRlZCkge1xuICAgICAgICBjb25zdCBzY2hlbWEgPSB0aGlzWyRzY2hlbWF0YV1baXRlbS50eXBlXTtcbiAgICAgICAgY29uc3QgZmllbGRzID0gWydhdHRyaWJ1dGVzJ10uY29uY2F0KE9iamVjdC5rZXlzKGl0ZW0ucmVsYXRpb25zaGlwcykpO1xuICAgICAgICBpZiAoIXNjaGVtYSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgUmVzdFN0b3JlIHJlY2VpdmVkIHVua25vd24gdHlwZSAnJHtpdGVtLnR5cGV9JyBpbiBIVFRQIHJlc3BvbnNlYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ub3RpZnlVcGRhdGUoc2NoZW1hLCBpdGVtLmlkLCBpdGVtLCBmaWVsZHMpO1xuICAgICAgfVxuICAgICAgY29uc3QgaXRlbSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICBjb25zdCByZXRWYWwgPSB7IHR5cGU6IGl0ZW0udHlwZSwgaWQ6IGl0ZW0uaWQsIGF0dHJpYnV0ZXM6IGl0ZW0uYXR0cmlidXRlcyB9O1xuICAgICAgaWYgKGtleXMpIHtcbiAgICAgICAgcmV0VmFsLnJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgICAgIGlmIChrZXkgaW4gaXRlbS5yZWxhdGlvbnNoaXBzKSB7XG4gICAgICAgICAgICByZXRWYWwucmVsYXRpb25zaGlwc1trZXldID0gaXRlbS5yZWxhdGlvbnNoaXBzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXRWYWwucmVsYXRpb25zaGlwcyA9IGl0ZW0ucmVsYXRpb25zaGlwcztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXRWYWw7XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVhZEF0dHJpYnV0ZXModCwgaWQpIHtcbiAgICByZXR1cm4gdGhpcy5yZWFkKHQsIGlkKVxuICAgIC50aGVuKGl0ZW0gPT4gaXRlbSA/IGl0ZW0uYXR0cmlidXRlcyA6IG51bGwpXG4gICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG4gIH1cblxuICByZWFkUmVsYXRpb25zaGlwcyh0LCBpZCwgcmVsYXRpb25zaGlwcykge1xuICAgIGNvbnN0IGtleXMgPSBBcnJheS5pc0FycmF5KHJlbGF0aW9uc2hpcHMpID8gcmVsYXRpb25zaGlwcyA6IFtyZWxhdGlvbnNoaXBzXTtcbiAgICByZXR1cm4gdGhpcy5yZWFkKHQsIGlkKVxuICAgIC50aGVuKGl0ZW0gPT4ge1xuICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgY29uc3QgcmV0VmFsID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgICAgICByZXRWYWxba2V5XSA9IGl0ZW0ucmVsYXRpb25zaGlwc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXRWYWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlYWRSZWxhdGlvbnNoaXAodCwgaWQsIHJlbGF0aW9uc2hpcCkge1xuICAgIHJldHVybiB0aGlzLnJlYWRSZWxhdGlvbnNoaXBzKHQsIGlkLCByZWxhdGlvbnNoaXApO1xuICB9XG5cbiAgYWRkKHR5cGUsIGlkLCByZWxhdGlvbnNoaXBUaXRsZSwgY2hpbGRJZCwgZXh0cmFzKSB7XG4gICAgY29uc3QgcmVsYXRpb25zaGlwQmxvY2sgPSB0eXBlLiRzY2hlbWEucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBUaXRsZV0udHlwZTtcbiAgICBjb25zdCBuZXdGaWVsZCA9IHsgaWQ6IGNoaWxkSWQgfTtcbiAgICBpZiAocmVsYXRpb25zaGlwQmxvY2suJGV4dHJhcykge1xuICAgICAgZm9yIChjb25zdCBleHRyYSBpbiBleHRyYXMpIHtcbiAgICAgICAgaWYgKGV4dHJhIGluIHJlbGF0aW9uc2hpcEJsb2NrLiRleHRyYXMpIHtcbiAgICAgICAgICBuZXdGaWVsZC5tZXRhID0gbmV3RmllbGQubWV0YSB8fCB7fTtcbiAgICAgICAgICBuZXdGaWVsZC5tZXRhW2V4dHJhXSA9IGV4dHJhc1tleHRyYV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5wdXQoYC8ke3R5cGUuJG5hbWV9LyR7aWR9LyR7cmVsYXRpb25zaGlwVGl0bGV9YCwgbmV3RmllbGQpXG4gICAgLnRoZW4oKCkgPT4gdGhpcy5ub3RpZnlVcGRhdGUodHlwZSwgaWQsIG51bGwsIHJlbGF0aW9uc2hpcFRpdGxlKSk7XG4gIH1cblxuICByZW1vdmUodCwgaWQsIHJlbGF0aW9uc2hpcFRpdGxlLCBjaGlsZElkKSB7XG4gICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5kZWxldGUoYC8ke3QuJG5hbWV9LyR7aWR9LyR7cmVsYXRpb25zaGlwVGl0bGV9LyR7Y2hpbGRJZH1gKVxuICAgIC50aGVuKCgpID0+IHRoaXMubm90aWZ5VXBkYXRlKHQsIGlkLCBudWxsLCByZWxhdGlvbnNoaXBUaXRsZSkpO1xuICB9XG5cbiAgbW9kaWZ5UmVsYXRpb25zaGlwKHQsIGlkLCByZWxhdGlvbnNoaXBUaXRsZSwgY2hpbGRJZCwgZXh0cmFzKSB7XG4gICAgcmV0dXJuIHRoaXNbJGF4aW9zXS5wYXRjaChgLyR7dC4kbmFtZX0vJHtpZH0vJHtyZWxhdGlvbnNoaXBUaXRsZX0vJHtjaGlsZElkfWAsIGV4dHJhcylcbiAgICAudGhlbigoKSA9PiB0aGlzLm5vdGlmeVVwZGF0ZSh0LCBpZCwgbnVsbCwgcmVsYXRpb25zaGlwVGl0bGUpKTtcbiAgfVxuXG4gIGRlbGV0ZSh0LCBpZCkge1xuICAgIHJldHVybiB0aGlzWyRheGlvc10uZGVsZXRlKGAvJHt0LiRuYW1lfS8ke2lkfWApXG4gICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEuZGF0YTtcbiAgICB9KTtcbiAgfVxuXG4gIHF1ZXJ5KHEpIHtcbiAgICByZXR1cm4gdGhpc1skYXhpb3NdLmdldChgLyR7cS50eXBlfWAsIHsgcGFyYW1zOiBxLnF1ZXJ5IH0pXG4gICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEuZGF0YTtcbiAgICB9KTtcbiAgfVxufVxuIl19
