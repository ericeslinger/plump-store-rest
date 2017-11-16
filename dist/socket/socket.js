'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.rpc = rpc;

var _ulid = require('ulid');

function rpc(io, channel, request) {
    return new Promise(function (resolve, reject) {
        request.responseKey = (0, _ulid.ulid)();
        io.once(request.responseKey, function (response) {
            resolve(response);
        });
        io.emit(channel, request);
    });
}