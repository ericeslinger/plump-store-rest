"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var SocketIO = require("socket.io-client");
var plump_1 = require("plump");
var RestStore = (function (_super) {
    __extends(RestStore, _super);
    function RestStore(opts) {
        var _this = _super.call(this, opts) || this;
        _this.httpInProgress = {};
        _this.options = Object.assign({}, {
            baseURL: 'http://localhost/api',
        }, opts);
        _this.axios = _this.options.axios || axios_1.default.create(_this.options);
        if (_this.options.socketURL) {
            _this.io = SocketIO(_this.options.socketURL, { transports: ['websocket'] });
            _this.io.on('connect', function () { return console.log('connected to socket'); });
            _this.io.on('plumpUpdate', function (data) { return _this.updateFromSocket(data); });
        }
        return _this;
    }
    RestStore.prototype.debounceGet = function (url) {
        var _this = this;
        if (!this.httpInProgress[url]) {
            this.httpInProgress[url] = this.axios.get(url).then(function (v) {
                delete _this.httpInProgress[url];
                return v;
            });
        }
        return this.httpInProgress[url];
    };
    RestStore.prototype.updateFromSocket = function (data) {
        try {
            if (data.eventType === 'update') {
                this.fireWriteUpdate({
                    type: data.type,
                    id: data.id,
                    invalidate: ['attributes'],
                });
            }
            else if (data.eventType === 'relationshipCreate') {
                this.fireWriteUpdate({
                    type: data.type,
                    id: data.id,
                    invalidate: [data.field],
                });
            }
            else if (data.eventType === 'relationshipUpdate') {
                this.fireWriteUpdate({
                    type: data.type,
                    id: data.id,
                    invalidate: [data.field],
                });
            }
            else if (data.eventType === 'relationshipDelete') {
                this.fireWriteUpdate({
                    type: data.type,
                    id: data.id,
                    invalidate: [data.field],
                });
            }
        }
        catch (e) {
            console.log('ERROR');
            console.log(e);
        }
    };
    RestStore.prototype.writeAttributes = function (value) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            if (value.id) {
                return _this.axios.patch("/" + value.type + "/" + value.id, value);
            }
            else if (_this.terminal) {
                return _this.axios.post("/" + value.type, value);
            }
            else {
                throw new Error('Cannot create new content in a non-terminal store');
            }
        })
            .then(function (response) {
            var result = response.data;
            _this.fireWriteUpdate({
                type: result.type,
                id: result.id,
                invalidate: ['attributes'],
            });
            return result;
        });
    };
    RestStore.prototype.readAttributes = function (item) {
        var _this = this;
        return Promise.resolve()
            .then(function () { return _this.debounceGet("/" + item.type + "/" + item.id); })
            .then(function (reply) {
            if (reply.status === 404) {
                return null;
            }
            else if (reply.status !== 200) {
                throw new Error(reply.statusText);
            }
            else {
                var result = reply.data;
                if (result.included) {
                    result.included.forEach(function (includedData) {
                        _this.fireReadUpdate(includedData);
                    });
                }
                return result;
            }
        })
            .catch(function (err) {
            if (err.response && err.response.status === 404) {
                return null;
            }
            else {
                throw err;
            }
        });
    };
    RestStore.prototype.readRelationship = function (value, relName) {
        var _this = this;
        return this.debounceGet("/" + value.type + "/" + value.id + "/" + relName)
            .then(function (response) {
            if (response.data.included) {
                response.data.included.forEach(function (item) {
                    _this.fireReadUpdate(item);
                });
            }
            return response.data;
        })
            .catch(function (err) {
            if (err.response && err.response.status === 404) {
                return [];
            }
            else {
                throw err;
            }
        });
    };
    RestStore.prototype.writeRelationshipItem = function (value, relName, child) {
        var _this = this;
        return this.axios
            .put("/" + value.type + "/" + value.id + "/" + relName, child)
            .then(function (res) {
            _this.fireWriteUpdate({
                type: value.type,
                id: value.id,
                invalidate: ["relationships." + relName],
            });
            return res.data;
        });
    };
    RestStore.prototype.deleteRelationshipItem = function (value, relName, child) {
        var _this = this;
        return this.axios
            .delete("/" + value.type + "/" + value.id + "/" + relName + "/" + child.id)
            .then(function (res) {
            _this.fireWriteUpdate({
                type: value.type,
                id: value.id,
                invalidate: ["relationships." + relName],
            });
            return res.data;
        });
    };
    RestStore.prototype.delete = function (value) {
        var _this = this;
        return this.axios.delete("/" + value.type + "/" + value.id).then(function (response) {
            _this.fireWriteUpdate({
                type: value.type,
                id: value.id,
                invalidate: ['attributes'],
            });
            return response.data;
        });
    };
    RestStore.prototype.query = function (type, q) {
        var _this = this;
        return this.axios.get("/" + type, { params: q }).then(function (response) {
            if (response.data.included) {
                response.data.included.forEach(function (item) {
                    _this.fireReadUpdate(item);
                });
            }
            return response.data.data;
        });
    };
    return RestStore;
}(plump_1.Storage));
exports.RestStore = RestStore;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LGdCQUFDO0FBQUQsQ0E3TEEsQUE2TEMsQ0E3TDhCLGVBQU8sR0E2THJDO0FBN0xZLDhCQUFTIiwiZmlsZSI6InJlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXhpb3MsIHsgQXhpb3NJbnN0YW5jZSwgQXhpb3NQcm9taXNlIH0gZnJvbSAnYXhpb3MnO1xuaW1wb3J0ICogYXMgU29ja2V0SU8gZnJvbSAnc29ja2V0LmlvLWNsaWVudCc7XG4vLyBpbXBvcnQgeyB0ZXN0QXV0aGVudGljYXRpb24gfSBmcm9tICcuL3NvY2tldC9hdXRoZW50aWNhdGlvbi5jaGFubmVsJztcblxuaW1wb3J0IHtcbiAgU3RvcmFnZSxcbiAgU3RvcmFnZU9wdGlvbnMsXG4gIEluZGVmaW5pdGVNb2RlbERhdGEsXG4gIE1vZGVsRGF0YSxcbiAgTW9kZWxSZWZlcmVuY2UsXG4gIFRlcm1pbmFsU3RvcmUsXG59IGZyb20gJ3BsdW1wJztcblxuZXhwb3J0IGludGVyZmFjZSBSZXN0T3B0aW9ucyBleHRlbmRzIFN0b3JhZ2VPcHRpb25zIHtcbiAgYmFzZVVSTD86IHN0cmluZztcbiAgYXhpb3M/OiBBeGlvc0luc3RhbmNlO1xuICBzb2NrZXRVUkw/OiBzdHJpbmc7XG4gIGFwaUtleT86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFJlc3RTdG9yZSBleHRlbmRzIFN0b3JhZ2UgaW1wbGVtZW50cyBUZXJtaW5hbFN0b3JlIHtcbiAgcHVibGljIGF4aW9zOiBBeGlvc0luc3RhbmNlO1xuICBwdWJsaWMgaW86IFNvY2tldElPQ2xpZW50LlNvY2tldDtcbiAgcHVibGljIG9wdGlvbnM6IFJlc3RPcHRpb25zO1xuICBodHRwSW5Qcm9ncmVzczogeyBbdXJsOiBzdHJpbmddOiBBeGlvc1Byb21pc2UgfSA9IHt9O1xuICBjb25zdHJ1Y3RvcihvcHRzOiBSZXN0T3B0aW9ucykge1xuICAgIHN1cGVyKG9wdHMpO1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7fSxcbiAgICAgIHtcbiAgICAgICAgYmFzZVVSTDogJ2h0dHA6Ly9sb2NhbGhvc3QvYXBpJyxcbiAgICAgIH0sXG4gICAgICBvcHRzLFxuICAgICk7XG5cbiAgICB0aGlzLmF4aW9zID0gdGhpcy5vcHRpb25zLmF4aW9zIHx8IEF4aW9zLmNyZWF0ZSh0aGlzLm9wdGlvbnMpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuc29ja2V0VVJMKSB7XG4gICAgICB0aGlzLmlvID0gU29ja2V0SU8odGhpcy5vcHRpb25zLnNvY2tldFVSTCwgeyB0cmFuc3BvcnRzOiBbJ3dlYnNvY2tldCddIH0pO1xuICAgICAgdGhpcy5pby5vbignY29ubmVjdCcsICgpID0+IGNvbnNvbGUubG9nKCdjb25uZWN0ZWQgdG8gc29ja2V0JykpO1xuICAgICAgdGhpcy5pby5vbigncGx1bXBVcGRhdGUnLCBkYXRhID0+IHRoaXMudXBkYXRlRnJvbVNvY2tldChkYXRhKSk7XG4gICAgfVxuICB9XG5cbiAgZGVib3VuY2VHZXQodXJsOiBzdHJpbmcpOiBBeGlvc1Byb21pc2Uge1xuICAgIGlmICghdGhpcy5odHRwSW5Qcm9ncmVzc1t1cmxdKSB7XG4gICAgICB0aGlzLmh0dHBJblByb2dyZXNzW3VybF0gPSB0aGlzLmF4aW9zLmdldCh1cmwpLnRoZW4odiA9PiB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmh0dHBJblByb2dyZXNzW3VybF07XG4gICAgICAgIHJldHVybiB2O1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmh0dHBJblByb2dyZXNzW3VybF07XG4gIH1cblxuICB1cGRhdGVGcm9tU29ja2V0KGRhdGEpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKGRhdGEuZXZlbnRUeXBlID09PSAndXBkYXRlJykge1xuICAgICAgICB0aGlzLmZpcmVXcml0ZVVwZGF0ZSh7XG4gICAgICAgICAgdHlwZTogZGF0YS50eXBlLFxuICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5ldmVudFR5cGUgPT09ICdyZWxhdGlvbnNoaXBDcmVhdGUnKSB7XG4gICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICB0eXBlOiBkYXRhLnR5cGUsXG4gICAgICAgICAgaWQ6IGRhdGEuaWQsXG4gICAgICAgICAgaW52YWxpZGF0ZTogW2RhdGEuZmllbGRdLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5ldmVudFR5cGUgPT09ICdyZWxhdGlvbnNoaXBVcGRhdGUnKSB7XG4gICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICB0eXBlOiBkYXRhLnR5cGUsXG4gICAgICAgICAgaWQ6IGRhdGEuaWQsXG4gICAgICAgICAgaW52YWxpZGF0ZTogW2RhdGEuZmllbGRdLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5ldmVudFR5cGUgPT09ICdyZWxhdGlvbnNoaXBEZWxldGUnKSB7XG4gICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICB0eXBlOiBkYXRhLnR5cGUsXG4gICAgICAgICAgaWQ6IGRhdGEuaWQsXG4gICAgICAgICAgaW52YWxpZGF0ZTogW2RhdGEuZmllbGRdLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZygnRVJST1InKTtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlQXR0cmlidXRlcyh2YWx1ZTogSW5kZWZpbml0ZU1vZGVsRGF0YSk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZS5pZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmF4aW9zLnBhdGNoKGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfWAsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRlcm1pbmFsKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYXhpb3MucG9zdChgLyR7dmFsdWUudHlwZX1gLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY3JlYXRlIG5ldyBjb250ZW50IGluIGEgbm9uLXRlcm1pbmFsIHN0b3JlJyk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICB0eXBlOiByZXN1bHQudHlwZSxcbiAgICAgICAgICBpZDogcmVzdWx0LmlkLFxuICAgICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pO1xuICB9XG5cbiAgcmVhZEF0dHJpYnV0ZXMoaXRlbTogTW9kZWxSZWZlcmVuY2UpOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgLnRoZW4oKCkgPT4gdGhpcy5kZWJvdW5jZUdldChgLyR7aXRlbS50eXBlfS8ke2l0ZW0uaWR9YCkpXG4gICAgICAudGhlbihyZXBseSA9PiB7XG4gICAgICAgIGlmIChyZXBseS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHJlcGx5LnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlcGx5LnN0YXR1c1RleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlcGx5LmRhdGE7XG4gICAgICAgICAgaWYgKHJlc3VsdC5pbmNsdWRlZCkge1xuICAgICAgICAgICAgcmVzdWx0LmluY2x1ZGVkLmZvckVhY2goaW5jbHVkZWREYXRhID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5maXJlUmVhZFVwZGF0ZShpbmNsdWRlZERhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgaWYgKGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgcmVhZFJlbGF0aW9uc2hpcCh2YWx1ZTogTW9kZWxSZWZlcmVuY2UsIHJlbE5hbWU6IHN0cmluZyk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuZGVib3VuY2VHZXQoYC8ke3ZhbHVlLnR5cGV9LyR7dmFsdWUuaWR9LyR7cmVsTmFtZX1gKVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2UuZGF0YS5pbmNsdWRlZCkge1xuICAgICAgICAgIHJlc3BvbnNlLmRhdGEuaW5jbHVkZWQuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmlyZVJlYWRVcGRhdGUoaXRlbSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICB3cml0ZVJlbGF0aW9uc2hpcEl0ZW0oXG4gICAgdmFsdWU6IE1vZGVsUmVmZXJlbmNlLFxuICAgIHJlbE5hbWU6IHN0cmluZyxcbiAgICBjaGlsZDogeyBpZDogc3RyaW5nIHwgbnVtYmVyIH0sXG4gICk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3NcbiAgICAgIC5wdXQoYC8ke3ZhbHVlLnR5cGV9LyR7dmFsdWUuaWR9LyR7cmVsTmFtZX1gLCBjaGlsZClcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICB0eXBlOiB2YWx1ZS50eXBlLFxuICAgICAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICAgICAgICBpbnZhbGlkYXRlOiBbYHJlbGF0aW9uc2hpcHMuJHtyZWxOYW1lfWBdLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgfSk7XG4gIH1cblxuICBkZWxldGVSZWxhdGlvbnNoaXBJdGVtKFxuICAgIHZhbHVlOiBNb2RlbFJlZmVyZW5jZSxcbiAgICByZWxOYW1lOiBzdHJpbmcsXG4gICAgY2hpbGQ6IHsgaWQ6IHN0cmluZyB8IG51bWJlciB9LFxuICApOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiB0aGlzLmF4aW9zXG4gICAgICAuZGVsZXRlKGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfS8ke3JlbE5hbWV9LyR7Y2hpbGQuaWR9YClcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICB0eXBlOiB2YWx1ZS50eXBlLFxuICAgICAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICAgICAgICBpbnZhbGlkYXRlOiBbYHJlbGF0aW9uc2hpcHMuJHtyZWxOYW1lfWBdLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgfSk7XG4gIH1cblxuICBkZWxldGUodmFsdWU6IE1vZGVsUmVmZXJlbmNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZGVsZXRlKGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfWApLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICB0eXBlOiB2YWx1ZS50eXBlLFxuICAgICAgICBpZDogdmFsdWUuaWQsXG4gICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9KTtcbiAgfVxuXG4gIHF1ZXJ5KHR5cGU6IHN0cmluZywgcTogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZ2V0KGAvJHt0eXBlfWAsIHsgcGFyYW1zOiBxIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgaWYgKHJlc3BvbnNlLmRhdGEuaW5jbHVkZWQpIHtcbiAgICAgICAgcmVzcG9uc2UuZGF0YS5pbmNsdWRlZC5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgIHRoaXMuZmlyZVJlYWRVcGRhdGUoaXRlbSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEuZGF0YTtcbiAgICB9KTtcbiAgfVxufVxuIl19
