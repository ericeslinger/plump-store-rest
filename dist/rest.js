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
        _this.options = Object.assign({}, {
            baseURL: 'http://localhost/api',
        }, opts);
        _this.axios = _this.options.axios || axios_1.default.create(_this.options);
        if (_this.options.socketURL) {
            _this.io = SocketIO(_this.options.socketURL);
            _this.io.on('connect', function () { return console.log('connected to socket'); });
        }
        return _this;
    }
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
            .then(function () { return _this.axios.get("/" + item.type + "/" + item.id); })
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
        return this.axios
            .get("/" + value.type + "/" + value.id + "/" + relName)
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUk7b0JBQ2pDLEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVCLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCxnQkFBQztBQUFELENBbEpBLEFBa0pDLENBbEo4QixlQUFPLEdBa0pyQztBQWxKWSw4QkFBUyIsImZpbGUiOiJyZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEF4aW9zLCB7IEF4aW9zSW5zdGFuY2UgfSBmcm9tICdheGlvcyc7XG5pbXBvcnQgKiBhcyBTb2NrZXRJTyBmcm9tICdzb2NrZXQuaW8tY2xpZW50Jztcbi8vIGltcG9ydCB7IHRlc3RBdXRoZW50aWNhdGlvbiB9IGZyb20gJy4vc29ja2V0L2F1dGhlbnRpY2F0aW9uLmNoYW5uZWwnO1xuXG5pbXBvcnQge1xuICBTdG9yYWdlLFxuICBTdG9yYWdlT3B0aW9ucyxcbiAgSW5kZWZpbml0ZU1vZGVsRGF0YSxcbiAgTW9kZWxEYXRhLFxuICBNb2RlbFJlZmVyZW5jZSxcbiAgVGVybWluYWxTdG9yZSxcbn0gZnJvbSAncGx1bXAnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3RPcHRpb25zIGV4dGVuZHMgU3RvcmFnZU9wdGlvbnMge1xuICBiYXNlVVJMPzogc3RyaW5nO1xuICBheGlvcz86IEF4aW9zSW5zdGFuY2U7XG4gIHNvY2tldFVSTD86IHN0cmluZztcbiAgYXBpS2V5Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgUmVzdFN0b3JlIGV4dGVuZHMgU3RvcmFnZSBpbXBsZW1lbnRzIFRlcm1pbmFsU3RvcmUge1xuICBwdWJsaWMgYXhpb3M6IEF4aW9zSW5zdGFuY2U7XG4gIHB1YmxpYyBpbzogU29ja2V0SU9DbGllbnQuU29ja2V0O1xuICBwcml2YXRlIG9wdGlvbnM6IFJlc3RPcHRpb25zO1xuICBwcml2YXRlIF9kaXNwYXRjaGluZzogUHJvbWlzZTxib29sZWFuPjtcbiAgY29uc3RydWN0b3Iob3B0czogUmVzdE9wdGlvbnMpIHtcbiAgICBzdXBlcihvcHRzKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICB7XG4gICAgICAgIGJhc2VVUkw6ICdodHRwOi8vbG9jYWxob3N0L2FwaScsXG4gICAgICB9LFxuICAgICAgb3B0cyxcbiAgICApO1xuXG4gICAgdGhpcy5heGlvcyA9IHRoaXMub3B0aW9ucy5heGlvcyB8fCBBeGlvcy5jcmVhdGUodGhpcy5vcHRpb25zKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnNvY2tldFVSTCkge1xuICAgICAgdGhpcy5pbyA9IFNvY2tldElPKHRoaXMub3B0aW9ucy5zb2NrZXRVUkwpO1xuICAgICAgdGhpcy5pby5vbignY29ubmVjdCcsICgpID0+IGNvbnNvbGUubG9nKCdjb25uZWN0ZWQgdG8gc29ja2V0JykpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlQXR0cmlidXRlcyh2YWx1ZTogSW5kZWZpbml0ZU1vZGVsRGF0YSk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZS5pZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmF4aW9zLnBhdGNoKGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfWAsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRlcm1pbmFsKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYXhpb3MucG9zdChgLyR7dmFsdWUudHlwZX1gLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY3JlYXRlIG5ldyBjb250ZW50IGluIGEgbm9uLXRlcm1pbmFsIHN0b3JlJyk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICB0eXBlOiByZXN1bHQudHlwZSxcbiAgICAgICAgICBpZDogcmVzdWx0LmlkLFxuICAgICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pO1xuICB9XG5cbiAgcmVhZEF0dHJpYnV0ZXMoaXRlbTogTW9kZWxSZWZlcmVuY2UpOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgLnRoZW4oKCkgPT4gdGhpcy5heGlvcy5nZXQoYC8ke2l0ZW0udHlwZX0vJHtpdGVtLmlkfWApKVxuICAgICAgLnRoZW4ocmVwbHkgPT4ge1xuICAgICAgICBpZiAocmVwbHkuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChyZXBseS5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXBseS5zdGF0dXNUZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSByZXBseS5kYXRhO1xuICAgICAgICAgIGlmIChyZXN1bHQuaW5jbHVkZWQpIHtcbiAgICAgICAgICAgIHJlc3VsdC5pbmNsdWRlZC5mb3JFYWNoKGluY2x1ZGVkRGF0YSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuZmlyZVJlYWRVcGRhdGUoaW5jbHVkZWREYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIHJlYWRSZWxhdGlvbnNoaXAodmFsdWU6IE1vZGVsUmVmZXJlbmNlLCByZWxOYW1lOiBzdHJpbmcpOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiB0aGlzLmF4aW9zXG4gICAgICAuZ2V0KGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfS8ke3JlbE5hbWV9YClcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEuaW5jbHVkZWQpIHtcbiAgICAgICAgICByZXNwb25zZS5kYXRhLmluY2x1ZGVkLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZpcmVSZWFkVXBkYXRlKGl0ZW0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgd3JpdGVSZWxhdGlvbnNoaXBJdGVtKFxuICAgIHZhbHVlOiBNb2RlbFJlZmVyZW5jZSxcbiAgICByZWxOYW1lOiBzdHJpbmcsXG4gICAgY2hpbGQ6IHsgaWQ6IHN0cmluZyB8IG51bWJlciB9LFxuICApOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiB0aGlzLmF4aW9zXG4gICAgICAucHV0KGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfS8ke3JlbE5hbWV9YCwgY2hpbGQpXG4gICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICB0aGlzLmZpcmVXcml0ZVVwZGF0ZSh7XG4gICAgICAgICAgdHlwZTogdmFsdWUudHlwZSxcbiAgICAgICAgICBpZDogdmFsdWUuaWQsXG4gICAgICAgICAgaW52YWxpZGF0ZTogW2ByZWxhdGlvbnNoaXBzLiR7cmVsTmFtZX1gXSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgIH0pO1xuICB9XG5cbiAgZGVsZXRlUmVsYXRpb25zaGlwSXRlbShcbiAgICB2YWx1ZTogTW9kZWxSZWZlcmVuY2UsXG4gICAgcmVsTmFtZTogc3RyaW5nLFxuICAgIGNoaWxkOiB7IGlkOiBzdHJpbmcgfCBudW1iZXIgfSxcbiAgKTogUHJvbWlzZTxNb2RlbERhdGE+IHtcbiAgICByZXR1cm4gdGhpcy5heGlvc1xuICAgICAgLmRlbGV0ZShgLyR7dmFsdWUudHlwZX0vJHt2YWx1ZS5pZH0vJHtyZWxOYW1lfS8ke2NoaWxkLmlkfWApXG4gICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICB0aGlzLmZpcmVXcml0ZVVwZGF0ZSh7XG4gICAgICAgICAgdHlwZTogdmFsdWUudHlwZSxcbiAgICAgICAgICBpZDogdmFsdWUuaWQsXG4gICAgICAgICAgaW52YWxpZGF0ZTogW2ByZWxhdGlvbnNoaXBzLiR7cmVsTmFtZX1gXSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgIH0pO1xuICB9XG5cbiAgZGVsZXRlKHZhbHVlOiBNb2RlbFJlZmVyZW5jZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmF4aW9zLmRlbGV0ZShgLyR7dmFsdWUudHlwZX0vJHt2YWx1ZS5pZH1gKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgdHlwZTogdmFsdWUudHlwZSxcbiAgICAgICAgaWQ6IHZhbHVlLmlkLFxuICAgICAgICBpbnZhbGlkYXRlOiBbJ2F0dHJpYnV0ZXMnXSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgfSk7XG4gIH1cblxuICBxdWVyeSh0eXBlOiBzdHJpbmcsIHE6IGFueSkge1xuICAgIHJldHVybiB0aGlzLmF4aW9zLmdldChgLyR7dHlwZX1gLCB7IHBhcmFtczogcSB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIGlmIChyZXNwb25zZS5kYXRhLmluY2x1ZGVkKSB7XG4gICAgICAgIHJlc3BvbnNlLmRhdGEuaW5jbHVkZWQuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICB0aGlzLmZpcmVSZWFkVXBkYXRlKGl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhLmRhdGE7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
