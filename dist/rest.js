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
var plump_1 = require("plump");
var RestStore = (function (_super) {
    __extends(RestStore, _super);
    function RestStore(opts) {
        var _this = _super.call(this, opts) || this;
        var options = Object.assign({}, {
            baseURL: 'http://localhost/api',
        }, opts);
        _this.axios = options.axios || axios_1.default.create(options);
        return _this;
    }
    RestStore.prototype.writeAttributes = function (value) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            if (value.id) {
                return _this.axios.patch("/" + value.typeName + "/" + value.id, value);
            }
            else if (_this.terminal) {
                return _this.axios.post("/" + value.typeName, value);
            }
            else {
                throw new Error('Cannot create new content in a non-terminal store');
            }
        })
            .then(function (response) {
            var result = response.data.data;
            _this.fireWriteUpdate({
                typeName: result.type,
                id: result.id,
                invalidate: ['attributes'],
            });
            return result;
        });
    };
    RestStore.prototype.readAttributes = function (item) {
        var _this = this;
        return Promise.resolve()
            .then(function () { return _this.axios.get("/" + item.typeName + "/" + item.id); })
            .then(function (response) {
            var result = response.data.data;
            if (response.data.included) {
                response.data.included.forEach(function (includedData) {
                    _this.fireReadUpdate(includedData);
                });
            }
            return result;
        }).catch(function (err) {
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
        return this.axios.get("/" + value.typeName + "/" + value.id + "/" + relName)
            .then(function (response) {
            if (response.data.included) {
                response.data.included.forEach(function (item) {
                    _this.fireReadUpdate(item);
                });
            }
            return response.data.data;
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
        return this.axios.put("/" + value.typeName + "/" + value.id + "/" + relName, child)
            .then(function (res) {
            _this.fireWriteUpdate({ typeName: value.typeName, id: value.id, invalidate: ["relationships." + relName] });
            return res.data;
        });
    };
    RestStore.prototype.deleteRelationshipItem = function (value, relName, child) {
        var _this = this;
        return this.axios.delete("/" + value.typeName + "/" + value.id + "/" + relName + "/" + child.id)
            .then(function (res) {
            _this.fireWriteUpdate({ typeName: value.typeName, id: value.id, invalidate: ["relationships." + relName] });
            return res.data;
        });
    };
    RestStore.prototype.delete = function (value) {
        var _this = this;
        return this.axios.delete("/" + value.typeName + "/" + value.id)
            .then(function (response) {
            _this.fireWriteUpdate({
                typeName: value.typeName,
                id: value.id,
                invalidate: ['attributes'],
            });
            return response.datas;
        });
    };
    RestStore.prototype.query = function (q) {
        return this.axios.get("/" + q.type, { params: q.query })
            .then(function (response) {
            return response.data;
        });
    };
    return RestStore;
}(plump_1.Storage));
exports.RestStore = RestStore;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q1osVUFBVSxFQUFFLENBQUMsWUFBWSxDQUFDO2FBQzNCLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHlCQUFLLEdBQUwsVUFBTSxDQUFDO1FBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQUksQ0FBQyxDQUFDLElBQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDdkQsSUFBSSxDQUFDLFVBQUMsUUFBUTtZQUNiLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNILGdCQUFDO0FBQUQsQ0E5R0EsQUE4R0MsQ0E5RzhCLGVBQU8sR0E4R3JDO0FBOUdZLDhCQUFTIiwiZmlsZSI6InJlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXhpb3MsIHsgQXhpb3NJbnN0YW5jZSB9IGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IFN0b3JhZ2UsIFN0b3JhZ2VPcHRpb25zLCBJbmRlZmluaXRlTW9kZWxEYXRhLCBNb2RlbERhdGEsIE1vZGVsUmVmZXJlbmNlLCBUZXJtaW5hbFN0b3JlIH0gZnJvbSAncGx1bXAnO1xuXG5leHBvcnQgY2xhc3MgUmVzdFN0b3JlIGV4dGVuZHMgU3RvcmFnZSBpbXBsZW1lbnRzIFRlcm1pbmFsU3RvcmUge1xuICBwcml2YXRlIGF4aW9zO1xuICBjb25zdHJ1Y3RvcihvcHRzOiBTdG9yYWdlT3B0aW9ucyAmIHsgYmFzZVVybD86IHN0cmluZywgYXhpb3M/OiBBeGlvc0luc3RhbmNlIH0pIHtcbiAgICBzdXBlcihvcHRzKTtcbiAgICBjb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBiYXNlVVJMOiAnaHR0cDovL2xvY2FsaG9zdC9hcGknLFxuICAgICAgfSxcbiAgICAgIG9wdHNcbiAgICApO1xuXG4gICAgdGhpcy5heGlvcyA9IG9wdGlvbnMuYXhpb3MgfHwgQXhpb3MuY3JlYXRlKG9wdGlvbnMpO1xuICB9XG5cbiAgd3JpdGVBdHRyaWJ1dGVzKHZhbHVlOiBJbmRlZmluaXRlTW9kZWxEYXRhKTogUHJvbWlzZTxNb2RlbERhdGE+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICBpZiAodmFsdWUuaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXhpb3MucGF0Y2goYC8ke3ZhbHVlLnR5cGVOYW1lfS8ke3ZhbHVlLmlkfWAsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50ZXJtaW5hbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5heGlvcy5wb3N0KGAvJHt2YWx1ZS50eXBlTmFtZX1gLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjcmVhdGUgbmV3IGNvbnRlbnQgaW4gYSBub24tdGVybWluYWwgc3RvcmUnKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gcmVzcG9uc2UuZGF0YS5kYXRhO1xuICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICB0eXBlTmFtZTogcmVzdWx0LnR5cGUsXG4gICAgICAgIGlkOiByZXN1bHQuaWQsXG4gICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuICB9XG5cbiAgcmVhZEF0dHJpYnV0ZXMoaXRlbTogTW9kZWxSZWZlcmVuY2UpOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIC50aGVuKCgpID0+IHRoaXMuYXhpb3MuZ2V0KGAvJHtpdGVtLnR5cGVOYW1lfS8ke2l0ZW0uaWR9YCkpXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSByZXNwb25zZS5kYXRhLmRhdGE7XG4gICAgICBpZiAocmVzcG9uc2UuZGF0YS5pbmNsdWRlZCkge1xuICAgICAgICByZXNwb25zZS5kYXRhLmluY2x1ZGVkLmZvckVhY2goKGluY2x1ZGVkRGF0YSkgPT4ge1xuICAgICAgICAgIHRoaXMuZmlyZVJlYWRVcGRhdGUoaW5jbHVkZWREYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVhZFJlbGF0aW9uc2hpcCh2YWx1ZTogTW9kZWxSZWZlcmVuY2UsIHJlbE5hbWU6IHN0cmluZyk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZ2V0KGAvJHt2YWx1ZS50eXBlTmFtZX0vJHt2YWx1ZS5pZH0vJHtyZWxOYW1lfWApXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAocmVzcG9uc2UuZGF0YS5pbmNsdWRlZCkge1xuICAgICAgICByZXNwb25zZS5kYXRhLmluY2x1ZGVkLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICB0aGlzLmZpcmVSZWFkVXBkYXRlKGl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhLmRhdGE7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgaWYgKGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgd3JpdGVSZWxhdGlvbnNoaXBJdGVtKCB2YWx1ZTogTW9kZWxSZWZlcmVuY2UsIHJlbE5hbWU6IHN0cmluZywgY2hpbGQ6IHtpZDogc3RyaW5nIHwgbnVtYmVyfSApOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiB0aGlzLmF4aW9zLnB1dChgLyR7dmFsdWUudHlwZU5hbWV9LyR7dmFsdWUuaWR9LyR7cmVsTmFtZX1gLCBjaGlsZClcbiAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICB0aGlzLmZpcmVXcml0ZVVwZGF0ZSh7IHR5cGVOYW1lOiB2YWx1ZS50eXBlTmFtZSwgaWQ6IHZhbHVlLmlkLCBpbnZhbGlkYXRlOiBbYHJlbGF0aW9uc2hpcHMuJHtyZWxOYW1lfWBdIH0pO1xuICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgZGVsZXRlUmVsYXRpb25zaGlwSXRlbSggdmFsdWU6IE1vZGVsUmVmZXJlbmNlLCByZWxOYW1lOiBzdHJpbmcsIGNoaWxkOiB7aWQ6IHN0cmluZyB8IG51bWJlcn0gKTogUHJvbWlzZTxNb2RlbERhdGE+IHtcbiAgICByZXR1cm4gdGhpcy5heGlvcy5kZWxldGUoYC8ke3ZhbHVlLnR5cGVOYW1lfS8ke3ZhbHVlLmlkfS8ke3JlbE5hbWV9LyR7Y2hpbGQuaWR9YClcbiAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICB0aGlzLmZpcmVXcml0ZVVwZGF0ZSh7IHR5cGVOYW1lOiB2YWx1ZS50eXBlTmFtZSwgaWQ6IHZhbHVlLmlkLCBpbnZhbGlkYXRlOiBbYHJlbGF0aW9uc2hpcHMuJHtyZWxOYW1lfWBdIH0pO1xuICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgZGVsZXRlKHZhbHVlOiBNb2RlbFJlZmVyZW5jZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmF4aW9zLmRlbGV0ZShgLyR7dmFsdWUudHlwZU5hbWV9LyR7dmFsdWUuaWR9YClcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgdHlwZU5hbWU6IHZhbHVlLnR5cGVOYW1lLFxuICAgICAgICBpZDogdmFsdWUuaWQsXG4gICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YXM7XG4gICAgfSk7XG4gIH1cblxuICBxdWVyeShxKSB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZ2V0KGAvJHtxLnR5cGV9YCwgeyBwYXJhbXM6IHEucXVlcnkgfSlcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
