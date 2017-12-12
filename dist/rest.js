'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RestStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _mergeOptions = require('merge-options');

var _mergeOptions2 = _interopRequireDefault(_mergeOptions);

var _plump = require('plump');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// import { testAuthentication } from './socket/authentication.channel';


var RestStore = exports.RestStore = function (_Storage) {
    _inherits(RestStore, _Storage);

    function RestStore(opts) {
        _classCallCheck(this, RestStore);

        var _this = _possibleConstructorReturn(this, (RestStore.__proto__ || Object.getPrototypeOf(RestStore)).call(this, opts));

        _this.httpInProgress = {};
        _this.options = Object.assign({}, {
            baseURL: 'http://localhost/api',
            onlyFireSocketEvents: false
        }, opts);
        _this.axios = _this.options.axios || _axios2.default.create(_this.options);
        if (_this.options.socketURL) {
            _this.io = (0, _socket2.default)(_this.options.socketURL, { transports: ['websocket'] });
            _this.io.on('connect', function () {
                return console.log('connected to socket');
            });
            _this.io.on('plumpUpdate', function (data) {
                return _this.updateFromSocket(data);
            });
        }
        return _this;
    }

    _createClass(RestStore, [{
        key: 'debounceGet',
        value: function debounceGet(url) {
            var _this2 = this;

            if (!this.httpInProgress[url]) {
                this.httpInProgress[url] = this.axios.get(url).then(function (v) {
                    delete _this2.httpInProgress[url];
                    return v;
                });
            }
            return this.httpInProgress[url];
        }
    }, {
        key: 'updateFromSocket',
        value: function updateFromSocket(data) {
            try {
                if (data.eventType === 'update') {
                    this.fireWriteUpdate({
                        type: data.type,
                        id: data.id,
                        invalidate: ['attributes']
                    });
                } else if (data.eventType === 'relationshipCreate') {
                    this.fireWriteUpdate({
                        type: data.type,
                        id: data.id,
                        invalidate: [data.field]
                    });
                } else if (data.eventType === 'relationshipUpdate') {
                    this.fireWriteUpdate({
                        type: data.type,
                        id: data.id,
                        invalidate: [data.field]
                    });
                } else if (data.eventType === 'relationshipDelete') {
                    this.fireWriteUpdate({
                        type: data.type,
                        id: data.id,
                        invalidate: [data.field]
                    });
                }
            } catch (e) {
                console.log('ERROR');
                console.log(e);
                console.log(data);
            }
        }
    }, {
        key: 'writeAttributes',
        value: function writeAttributes(value) {
            var _this3 = this;

            return Promise.resolve().then(function () {
                if (value.id) {
                    return _this3.axios.patch('/' + value.type + '/' + value.id, value);
                } else if (_this3.terminal) {
                    return _this3.axios.post('/' + value.type, value);
                } else {
                    throw new Error('Cannot create new content in a non-terminal store');
                }
            }).then(function (response) {
                var result = response.data;
                if (!_this3.options.onlyFireSocketEvents) {
                    _this3.fireWriteUpdate({
                        type: result.type,
                        id: result.id,
                        invalidate: ['attributes']
                    });
                }
                return result;
            });
        }
    }, {
        key: 'fixDates',
        value: function fixDates(d) {
            if (!d.attributes && !d.relationships) {
                return d;
            }
            var schema = this.getSchema(d.type);
            var override = {
                attributes: {},
                relationships: {}
            };
            Object.keys(schema.attributes).filter(function (attr) {
                return schema.attributes[attr].type === 'date';
            }).forEach(function (dateAttr) {
                override.attributes[dateAttr] = new Date(d.attributes[dateAttr]);
            });
            Object.keys(schema.relationships).forEach(function (relName) {
                if (d.relationships && d.relationships[relName] && d.relationships[relName].length > 0 && schema.relationships[relName].type.extras) {
                    var toChange = Object.keys(schema.relationships[relName].type.extras).filter(function (extraField) {
                        if (schema.relationships[relName].type.extras[extraField].type === 'date') {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (toChange.length > 0) {
                        override.relationships[relName] = d.relationships[relName].map(function (rel) {
                            return _mergeOptions2.default.apply(undefined, _toConsumableArray([rel].concat(toChange.map(function (tc) {
                                return {
                                    meta: _defineProperty({}, tc, new Date(rel.meta[tc]))
                                };
                            }))));
                        });
                    }
                }
            });
            return (0, _mergeOptions2.default)({}, d, override);
        }
    }, {
        key: 'readAttributes',
        value: function readAttributes(req) {
            var _this4 = this;

            var url = '/' + req.item.type + '/' + req.item.id;
            if (req.view) {
                url = url + '?view=' + req.view;
            }
            return Promise.resolve().then(function () {
                return _this4.debounceGet(url);
            }).then(function (reply) {
                if (reply.status === 404) {
                    return null;
                } else if (reply.status !== 200) {
                    throw new Error(reply.statusText);
                } else {
                    var result = reply.data;
                    if (result.included) {
                        result.included.forEach(function (includedData) {
                            _this4.fireReadUpdate(_this4.fixDates(includedData));
                        });
                    }
                    return _this4.fixDates(result);
                }
            }).then(function (v) {
                return new Promise(function (resolve) {
                    return setTimeout(function () {
                        return resolve(v);
                    }, 5);
                });
            }) // make sure results are cached.
            .catch(function (err) {
                if (err.response && err.response.status === 404) {
                    return null;
                } else {
                    throw err;
                }
            });
        }
    }, {
        key: 'readRelationship',
        value: function readRelationship(req) {
            var _this5 = this;

            return this.debounceGet('/' + req.item.type + '/' + req.item.id + '/' + req.rel).then(function (response) {
                if (response.data.included) {
                    response.data.included.forEach(function (item) {
                        _this5.fireReadUpdate(_this5.fixDates(item));
                    });
                }
                return _this5.fixDates(response.data);
            }).catch(function (err) {
                if (err.response && err.response.status === 404) {
                    return [];
                } else {
                    throw err;
                }
            });
        }
    }, {
        key: 'writeRelationshipItem',
        value: function writeRelationshipItem(value, relName, child) {
            var _this6 = this;

            return this.axios.put('/' + value.type + '/' + value.id + '/' + relName, child).then(function (res) {
                if (!_this6.options.onlyFireSocketEvents) {
                    _this6.fireWriteUpdate({
                        type: value.type,
                        id: value.id,
                        invalidate: ['relationships.' + relName]
                    });
                }
                return res.data;
            });
        }
    }, {
        key: 'deleteRelationshipItem',
        value: function deleteRelationshipItem(value, relName, child) {
            var _this7 = this;

            return this.axios.delete('/' + value.type + '/' + value.id + '/' + relName + '/' + child.id).then(function (res) {
                if (!_this7.options.onlyFireSocketEvents) {
                    _this7.fireWriteUpdate({
                        type: value.type,
                        id: value.id,
                        invalidate: ['relationships.' + relName]
                    });
                }
                return res.data;
            });
        }
    }, {
        key: 'delete',
        value: function _delete(value) {
            var _this8 = this;

            return this.axios.delete('/' + value.type + '/' + value.id).then(function (response) {
                if (!_this8.options.onlyFireSocketEvents) {
                    _this8.fireWriteUpdate({
                        type: value.type,
                        id: value.id,
                        invalidate: ['attributes']
                    });
                }
                return response.data;
            });
        }
    }, {
        key: 'query',
        value: function query(type, q) {
            var _this9 = this;

            return this.axios.get('/' + type, { params: q }).then(function (response) {
                if (response.data.included) {
                    response.data.included.forEach(function (item) {
                        _this9.fireReadUpdate(_this9.fixDates(item));
                    });
                }
                return response.data.data.map(function (v) {
                    return _this9.fixDates(v);
                });
            });
        }
    }]);

    return RestStore;
}(_plump.Storage);