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
var mergeOptions = require("merge-options");
var plump_1 = require("plump");
var RestStore = (function (_super) {
    __extends(RestStore, _super);
    function RestStore(opts) {
        var _this = _super.call(this, opts) || this;
        _this.httpInProgress = {};
        _this.options = Object.assign({}, {
            baseURL: 'http://localhost/api',
            onlyFireSocketEvents: false,
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
            if (!_this.options.onlyFireSocketEvents) {
                _this.fireWriteUpdate({
                    type: result.type,
                    id: result.id,
                    invalidate: ['attributes'],
                });
            }
            return result;
        });
    };
    RestStore.prototype.fixDates = function (d) {
        if (!d.attributes) {
            return d;
        }
        var schema = this.getSchema(d.type);
        var override = {
            attributes: {},
        };
        Object.keys(schema.attributes)
            .filter(function (attr) { return schema.attributes[attr].type === 'date'; })
            .forEach(function (dateAttr) {
            override.attributes[dateAttr] = new Date(d.attributes[dateAttr]);
        });
        return mergeOptions({}, d, override);
    };
    RestStore.prototype.readAttributes = function (item) {
        var _this = this;
        if (!item.id) {
            console.log(item);
            throw new Error('cannot fetch item with no id');
        }
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
                        _this.fireReadUpdate(_this.fixDates(includedData));
                    });
                }
                return _this.fixDates(result);
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
            if (!_this.options.onlyFireSocketEvents) {
                _this.fireWriteUpdate({
                    type: value.type,
                    id: value.id,
                    invalidate: ["relationships." + relName],
                });
            }
            return res.data;
        });
    };
    RestStore.prototype.deleteRelationshipItem = function (value, relName, child) {
        var _this = this;
        return this.axios
            .delete("/" + value.type + "/" + value.id + "/" + relName + "/" + child.id)
            .then(function (res) {
            if (!_this.options.onlyFireSocketEvents) {
                _this.fireWriteUpdate({
                    type: value.type,
                    id: value.id,
                    invalidate: ["relationships." + relName],
                });
            }
            return res.data;
        });
    };
    RestStore.prototype.delete = function (value) {
        var _this = this;
        return this.axios.delete("/" + value.type + "/" + value.id).then(function (response) {
            if (!_this.options.onlyFireSocketEvents) {
                _this.fireWriteUpdate({
                    type: value.type,
                    id: value.id,
                    invalidate: ['attributes'],
                });
            }
            return response.data;
        });
    };
    RestStore.prototype.query = function (type, q) {
        var _this = this;
        return this.axios.get("/" + type, { params: q }).then(function (response) {
            if (response.data.included) {
                response.data.included.forEach(function (item) {
                    _this.fireReadUpdate(_this.fixDates(item));
                });
            }
            return response.data.data.map(function (v) { return _this.fixDates(v); });
        });
    };
    return RestStore;
}(plump_1.Storage));
exports.RestStore = RestStore;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7b0JBQ2pDLEtBQUksQ0FBQyxjQUFjLENBQUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7WUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNILGdCQUFDO0FBQUQsQ0FsT0EsQUFrT0MsQ0FsTzhCLGVBQU8sR0FrT3JDO0FBbE9ZLDhCQUFTIiwiZmlsZSI6InJlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXhpb3MsIHsgQXhpb3NJbnN0YW5jZSwgQXhpb3NQcm9taXNlIH0gZnJvbSAnYXhpb3MnO1xuaW1wb3J0ICogYXMgU29ja2V0SU8gZnJvbSAnc29ja2V0LmlvLWNsaWVudCc7XG5pbXBvcnQgKiBhcyBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG4vLyBpbXBvcnQgeyB0ZXN0QXV0aGVudGljYXRpb24gfSBmcm9tICcuL3NvY2tldC9hdXRoZW50aWNhdGlvbi5jaGFubmVsJztcblxuaW1wb3J0IHtcbiAgU3RvcmFnZSxcbiAgU3RvcmFnZU9wdGlvbnMsXG4gIEluZGVmaW5pdGVNb2RlbERhdGEsXG4gIE1vZGVsRGF0YSxcbiAgTW9kZWxSZWZlcmVuY2UsXG4gIFRlcm1pbmFsU3RvcmUsXG59IGZyb20gJ3BsdW1wJztcblxuZXhwb3J0IGludGVyZmFjZSBSZXN0T3B0aW9ucyBleHRlbmRzIFN0b3JhZ2VPcHRpb25zIHtcbiAgYmFzZVVSTD86IHN0cmluZztcbiAgYXhpb3M/OiBBeGlvc0luc3RhbmNlO1xuICBzb2NrZXRVUkw/OiBzdHJpbmc7XG4gIGFwaUtleT86IHN0cmluZztcbiAgb25seUZpcmVTb2NrZXRFdmVudHM/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgUmVzdFN0b3JlIGV4dGVuZHMgU3RvcmFnZSBpbXBsZW1lbnRzIFRlcm1pbmFsU3RvcmUge1xuICBwdWJsaWMgYXhpb3M6IEF4aW9zSW5zdGFuY2U7XG4gIHB1YmxpYyBpbzogU29ja2V0SU9DbGllbnQuU29ja2V0O1xuICBwdWJsaWMgb3B0aW9uczogUmVzdE9wdGlvbnM7XG4gIGh0dHBJblByb2dyZXNzOiB7IFt1cmw6IHN0cmluZ106IEF4aW9zUHJvbWlzZSB9ID0ge307XG4gIGNvbnN0cnVjdG9yKG9wdHM6IFJlc3RPcHRpb25zKSB7XG4gICAgc3VwZXIob3B0cyk7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBiYXNlVVJMOiAnaHR0cDovL2xvY2FsaG9zdC9hcGknLFxuICAgICAgICBvbmx5RmlyZVNvY2tldEV2ZW50czogZmFsc2UsXG4gICAgICB9LFxuICAgICAgb3B0cyxcbiAgICApO1xuXG4gICAgdGhpcy5heGlvcyA9IHRoaXMub3B0aW9ucy5heGlvcyB8fCBBeGlvcy5jcmVhdGUodGhpcy5vcHRpb25zKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnNvY2tldFVSTCkge1xuICAgICAgdGhpcy5pbyA9IFNvY2tldElPKHRoaXMub3B0aW9ucy5zb2NrZXRVUkwsIHsgdHJhbnNwb3J0czogWyd3ZWJzb2NrZXQnXSB9KTtcbiAgICAgIHRoaXMuaW8ub24oJ2Nvbm5lY3QnLCAoKSA9PiBjb25zb2xlLmxvZygnY29ubmVjdGVkIHRvIHNvY2tldCcpKTtcbiAgICAgIHRoaXMuaW8ub24oJ3BsdW1wVXBkYXRlJywgZGF0YSA9PiB0aGlzLnVwZGF0ZUZyb21Tb2NrZXQoZGF0YSkpO1xuICAgIH1cbiAgfVxuXG4gIGRlYm91bmNlR2V0KHVybDogc3RyaW5nKTogQXhpb3NQcm9taXNlIHtcbiAgICBpZiAoIXRoaXMuaHR0cEluUHJvZ3Jlc3NbdXJsXSkge1xuICAgICAgdGhpcy5odHRwSW5Qcm9ncmVzc1t1cmxdID0gdGhpcy5heGlvcy5nZXQodXJsKS50aGVuKHYgPT4ge1xuICAgICAgICBkZWxldGUgdGhpcy5odHRwSW5Qcm9ncmVzc1t1cmxdO1xuICAgICAgICByZXR1cm4gdjtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5odHRwSW5Qcm9ncmVzc1t1cmxdO1xuICB9XG5cbiAgdXBkYXRlRnJvbVNvY2tldChkYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChkYXRhLmV2ZW50VHlwZSA9PT0gJ3VwZGF0ZScpIHtcbiAgICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICAgIHR5cGU6IGRhdGEudHlwZSxcbiAgICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgICBpbnZhbGlkYXRlOiBbJ2F0dHJpYnV0ZXMnXSxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZXZlbnRUeXBlID09PSAncmVsYXRpb25zaGlwQ3JlYXRlJykge1xuICAgICAgICB0aGlzLmZpcmVXcml0ZVVwZGF0ZSh7XG4gICAgICAgICAgdHlwZTogZGF0YS50eXBlLFxuICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgIGludmFsaWRhdGU6IFtkYXRhLmZpZWxkXSxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZXZlbnRUeXBlID09PSAncmVsYXRpb25zaGlwVXBkYXRlJykge1xuICAgICAgICB0aGlzLmZpcmVXcml0ZVVwZGF0ZSh7XG4gICAgICAgICAgdHlwZTogZGF0YS50eXBlLFxuICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgIGludmFsaWRhdGU6IFtkYXRhLmZpZWxkXSxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZXZlbnRUeXBlID09PSAncmVsYXRpb25zaGlwRGVsZXRlJykge1xuICAgICAgICB0aGlzLmZpcmVXcml0ZVVwZGF0ZSh7XG4gICAgICAgICAgdHlwZTogZGF0YS50eXBlLFxuICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgIGludmFsaWRhdGU6IFtkYXRhLmZpZWxkXSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coJ0VSUk9SJyk7XG4gICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZUF0dHJpYnV0ZXModmFsdWU6IEluZGVmaW5pdGVNb2RlbERhdGEpOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAodmFsdWUuaWQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5heGlvcy5wYXRjaChgLyR7dmFsdWUudHlwZX0vJHt2YWx1ZS5pZH1gLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy50ZXJtaW5hbCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmF4aW9zLnBvc3QoYC8ke3ZhbHVlLnR5cGV9YCwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNyZWF0ZSBuZXcgY29udGVudCBpbiBhIG5vbi10ZXJtaW5hbCBzdG9yZScpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5vbmx5RmlyZVNvY2tldEV2ZW50cykge1xuICAgICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICAgIHR5cGU6IHJlc3VsdC50eXBlLFxuICAgICAgICAgICAgaWQ6IHJlc3VsdC5pZCxcbiAgICAgICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9KTtcbiAgfVxuXG4gIGZpeERhdGVzKGQ6IE1vZGVsRGF0YSkge1xuICAgIGlmICghZC5hdHRyaWJ1dGVzKSB7XG4gICAgICByZXR1cm4gZDtcbiAgICB9XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoZC50eXBlKTtcbiAgICBjb25zdCBvdmVycmlkZSA9IHtcbiAgICAgIGF0dHJpYnV0ZXM6IHt9LFxuICAgIH07XG4gICAgT2JqZWN0LmtleXMoc2NoZW1hLmF0dHJpYnV0ZXMpXG4gICAgICAuZmlsdGVyKGF0dHIgPT4gc2NoZW1hLmF0dHJpYnV0ZXNbYXR0cl0udHlwZSA9PT0gJ2RhdGUnKVxuICAgICAgLmZvckVhY2goZGF0ZUF0dHIgPT4ge1xuICAgICAgICBvdmVycmlkZS5hdHRyaWJ1dGVzW2RhdGVBdHRyXSA9IG5ldyBEYXRlKGQuYXR0cmlidXRlc1tkYXRlQXR0cl0pO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIG1lcmdlT3B0aW9ucyh7fSwgZCwgb3ZlcnJpZGUpO1xuICB9XG5cbiAgcmVhZEF0dHJpYnV0ZXMoaXRlbTogTW9kZWxSZWZlcmVuY2UpOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIGlmICghaXRlbS5pZCkge1xuICAgICAgY29uc29sZS5sb2coaXRlbSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm5vdCBmZXRjaCBpdGVtIHdpdGggbm8gaWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLmRlYm91bmNlR2V0KGAvJHtpdGVtLnR5cGV9LyR7aXRlbS5pZH1gKSlcbiAgICAgIC50aGVuKHJlcGx5ID0+IHtcbiAgICAgICAgaWYgKHJlcGx5LnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAocmVwbHkuc3RhdHVzICE9PSAyMDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVwbHkuc3RhdHVzVGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVwbHkuZGF0YTtcbiAgICAgICAgICBpZiAocmVzdWx0LmluY2x1ZGVkKSB7XG4gICAgICAgICAgICByZXN1bHQuaW5jbHVkZWQuZm9yRWFjaChpbmNsdWRlZERhdGEgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmZpcmVSZWFkVXBkYXRlKHRoaXMuZml4RGF0ZXMoaW5jbHVkZWREYXRhKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoaXRlbS50eXBlKTtcbiAgICAgICAgICAvLyBPYmplY3Qua2V5cyhzY2hlbWEuYXR0cmlidXRlcylcbiAgICAgICAgICAvLyAgIC5maWx0ZXIoYXR0ciA9PiBzY2hlbWEuYXR0cmlidXRlc1thdHRyXS50eXBlID09PSAnZGF0ZScpXG4gICAgICAgICAgLy8gICAuZm9yRWFjaChkYXRlQXR0ciA9PiB7XG4gICAgICAgICAgLy8gICAgIHJlc3VsdC5hdHRyaWJ1dGVzW2RhdGVBdHRyXSA9IG5ldyBEYXRlKFxuICAgICAgICAgIC8vICAgICAgIHJlc3VsdC5hdHRyaWJ1dGVzW2RhdGVBdHRyXSxcbiAgICAgICAgICAvLyAgICAgKTtcbiAgICAgICAgICAvLyAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzLmZpeERhdGVzKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgaWYgKGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgcmVhZFJlbGF0aW9uc2hpcCh2YWx1ZTogTW9kZWxSZWZlcmVuY2UsIHJlbE5hbWU6IHN0cmluZyk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuZGVib3VuY2VHZXQoYC8ke3ZhbHVlLnR5cGV9LyR7dmFsdWUuaWR9LyR7cmVsTmFtZX1gKVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2UuZGF0YS5pbmNsdWRlZCkge1xuICAgICAgICAgIHJlc3BvbnNlLmRhdGEuaW5jbHVkZWQuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmlyZVJlYWRVcGRhdGUoaXRlbSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICB3cml0ZVJlbGF0aW9uc2hpcEl0ZW0oXG4gICAgdmFsdWU6IE1vZGVsUmVmZXJlbmNlLFxuICAgIHJlbE5hbWU6IHN0cmluZyxcbiAgICBjaGlsZDogeyBpZDogc3RyaW5nIHwgbnVtYmVyIH0sXG4gICk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3NcbiAgICAgIC5wdXQoYC8ke3ZhbHVlLnR5cGV9LyR7dmFsdWUuaWR9LyR7cmVsTmFtZX1gLCBjaGlsZClcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLm9ubHlGaXJlU29ja2V0RXZlbnRzKSB7XG4gICAgICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICAgICAgdHlwZTogdmFsdWUudHlwZSxcbiAgICAgICAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICAgICAgICAgIGludmFsaWRhdGU6IFtgcmVsYXRpb25zaGlwcy4ke3JlbE5hbWV9YF0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgfSk7XG4gIH1cblxuICBkZWxldGVSZWxhdGlvbnNoaXBJdGVtKFxuICAgIHZhbHVlOiBNb2RlbFJlZmVyZW5jZSxcbiAgICByZWxOYW1lOiBzdHJpbmcsXG4gICAgY2hpbGQ6IHsgaWQ6IHN0cmluZyB8IG51bWJlciB9LFxuICApOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiB0aGlzLmF4aW9zXG4gICAgICAuZGVsZXRlKGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfS8ke3JlbE5hbWV9LyR7Y2hpbGQuaWR9YClcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLm9ubHlGaXJlU29ja2V0RXZlbnRzKSB7XG4gICAgICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICAgICAgdHlwZTogdmFsdWUudHlwZSxcbiAgICAgICAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICAgICAgICAgIGludmFsaWRhdGU6IFtgcmVsYXRpb25zaGlwcy4ke3JlbE5hbWV9YF0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgfSk7XG4gIH1cblxuICBkZWxldGUodmFsdWU6IE1vZGVsUmVmZXJlbmNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZGVsZXRlKGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfWApLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMub25seUZpcmVTb2NrZXRFdmVudHMpIHtcbiAgICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICAgIHR5cGU6IHZhbHVlLnR5cGUsXG4gICAgICAgICAgaWQ6IHZhbHVlLmlkLFxuICAgICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgcXVlcnkodHlwZTogc3RyaW5nLCBxOiBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5heGlvcy5nZXQoYC8ke3R5cGV9YCwgeyBwYXJhbXM6IHEgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICBpZiAocmVzcG9uc2UuZGF0YS5pbmNsdWRlZCkge1xuICAgICAgICByZXNwb25zZS5kYXRhLmluY2x1ZGVkLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgdGhpcy5maXJlUmVhZFVwZGF0ZSh0aGlzLmZpeERhdGVzKGl0ZW0pKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5kYXRhLm1hcCh2ID0+IHRoaXMuZml4RGF0ZXModikpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
