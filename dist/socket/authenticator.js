'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Authenticator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ulid = require('ulid');

var _rxjs = require('rxjs');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Authenticator = exports.Authenticator = function () {
    function Authenticator(store) {
        var _this = this;

        _classCallCheck(this, Authenticator);

        this.store = store;
        this._key$ = new _rxjs.BehaviorSubject(null);
        this._state$ = new _rxjs.BehaviorSubject('untested');
        this._method$ = new _rxjs.Subject();
        this._you$ = new _rxjs.Subject();
        this.state$ = this._state$.asObservable();
        this.key$ = this._key$.asObservable();
        this.method$ = this._method$.asObservable();
        this.you$ = this._you$.asObservable();
        this.nonce = (0, _ulid.ulid)();
        this.store.io.on(this.nonce, function (msg) {
            switch (msg.response) {
                case 'token':
                    return _this.dispatchToken(msg);
                case 'startauth':
                    return _this.dispatchStart(msg);
                case 'invalidRequest':
                    return _this.dispatchInvalid(msg);
                case 'testkey':
                    return _this.dispatchTestKey(msg);
            }
        });
    }

    _createClass(Authenticator, [{
        key: 'dispatchToken',
        value: function dispatchToken(msg) {
            if (msg.status === 'success') {
                this._state$.next('testing');
                this.attemptKey(msg.token);
            }
        }
    }, {
        key: 'dispatchStart',
        value: function dispatchStart(msg) {
            this._method$.next(msg.types);
        }
    }, {
        key: 'dispatchInvalid',
        value: function dispatchInvalid(msg) {
            this._state$.next('error');
            console.log('Error - invalid authentication channel message sent');
            console.log(msg);
        }
    }, {
        key: 'dispatchTestKey',
        value: function dispatchTestKey(msg) {
            var _this2 = this;

            if (msg.auth === true) {
                this.store.axios.defaults.headers.common['Authorization'] = 'Bearer ' + msg.token;
                this._key$.next(msg.token);
                if (msg.you) {
                    this._you$.next(msg.you);
                }
                if (msg.included) {
                    msg.included.forEach(function (val) {
                        return _this2.store.fireReadUpdate(val);
                    });
                }
                this._state$.next('ready');
            } else {
                console.log('invalid key');
                this.initiateLogin();
            }
            /* noop */
        }
    }, {
        key: 'attemptKey',
        value: function attemptKey(k) {
            this._state$.next('testing');
            var req = {
                request: 'testkey',
                key: k,
                responseKey: this.nonce
            };
            this.store.io.emit('auth', req);
        }
    }, {
        key: 'initiateLogin',
        value: function initiateLogin() {
            this._state$.next('invalid');
            var req = {
                request: 'startauth',
                nonce: this.nonce,
                responseKey: this.nonce
            };
            this.store.io.emit('auth', req);
        }
    }]);

    return Authenticator;
}();