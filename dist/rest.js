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
            console.log('promise rejection in rest');
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
        return this.axios.get("/" + value.type + "/" + value.id + "/" + relName)
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
        return this.axios.put("/" + value.type + "/" + value.id + "/" + relName, child)
            .then(function (res) {
            _this.fireWriteUpdate({ type: value.type, id: value.id, invalidate: ["relationships." + relName] });
            return res.data;
        });
    };
    RestStore.prototype.deleteRelationshipItem = function (value, relName, child) {
        var _this = this;
        return this.axios.delete("/" + value.type + "/" + value.id + "/" + relName + "/" + child.id)
            .then(function (res) {
            _this.fireWriteUpdate({ type: value.type, id: value.id, invalidate: ["relationships." + relName] });
            return res.data;
        });
    };
    RestStore.prototype.delete = function (value) {
        var _this = this;
        return this.axios.delete("/" + value.type + "/" + value.id)
            .then(function (response) {
            _this.fireWriteUpdate({
                type: value.type,
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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SUFDTCxDQUFDO0lBRUQsMEJBQU0sR0FBTixVQUFPLEtBQXFCO1FBQTVCLGlCQVVDO1FBVEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQUksS0FBSyxDQUFDLElBQUksU0FBSSxLQUFLLENBQUMsRUFBSSxDQUFDO2FBQ3JELElBQUksQ0FBQyxVQUFDLFFBQVE7WUFDYixLQUFJLENBQUMsZUFBZSxDQUFDO2dCQUNuQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7Z0JBQ2hCLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDWixVQUFVLEVBQUUsQ0FBQyxZQUFZLENBQUM7YUFDM0IsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQseUJBQUssR0FBTCxVQUFNLENBQUM7UUFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBSSxDQUFDLENBQUMsSUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUN2RCxJQUFJLENBQUMsVUFBQyxRQUFRO1lBQ2IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0gsZ0JBQUM7QUFBRCxDQTFIQSxBQTBIQyxDQTFIOEIsZUFBTyxHQTBIckM7QUExSFksOEJBQVMiLCJmaWxlIjoicmVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBeGlvcywgeyBBeGlvc0luc3RhbmNlIH0gZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHsgU3RvcmFnZSwgU3RvcmFnZU9wdGlvbnMsIEluZGVmaW5pdGVNb2RlbERhdGEsIE1vZGVsRGF0YSwgTW9kZWxSZWZlcmVuY2UsIFRlcm1pbmFsU3RvcmUgfSBmcm9tICdwbHVtcCc7XG5cbmV4cG9ydCBjbGFzcyBSZXN0U3RvcmUgZXh0ZW5kcyBTdG9yYWdlIGltcGxlbWVudHMgVGVybWluYWxTdG9yZSB7XG4gIHByaXZhdGUgYXhpb3M7XG4gIGNvbnN0cnVjdG9yKG9wdHM6IFN0b3JhZ2VPcHRpb25zICYgeyBiYXNlVVJMPzogc3RyaW5nLCBheGlvcz86IEF4aW9zSW5zdGFuY2UgfSkge1xuICAgIHN1cGVyKG9wdHMpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICB7XG4gICAgICAgIGJhc2VVUkw6ICdodHRwOi8vbG9jYWxob3N0L2FwaScsXG4gICAgICB9LFxuICAgICAgb3B0c1xuICAgICk7XG5cbiAgICB0aGlzLmF4aW9zID0gb3B0aW9ucy5heGlvcyB8fCBBeGlvcy5jcmVhdGUob3B0aW9ucyk7XG4gIH1cblxuICB3cml0ZUF0dHJpYnV0ZXModmFsdWU6IEluZGVmaW5pdGVNb2RlbERhdGEpOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgIGlmICh2YWx1ZS5pZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5heGlvcy5wYXRjaChgLyR7dmFsdWUudHlwZX0vJHt2YWx1ZS5pZH1gLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudGVybWluYWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXhpb3MucG9zdChgLyR7dmFsdWUudHlwZX1gLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjcmVhdGUgbmV3IGNvbnRlbnQgaW4gYSBub24tdGVybWluYWwgc3RvcmUnKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgdHlwZTogcmVzdWx0LnR5cGUsXG4gICAgICAgIGlkOiByZXN1bHQuaWQsXG4gICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuICB9XG5cbiAgcmVhZEF0dHJpYnV0ZXMoaXRlbTogTW9kZWxSZWZlcmVuY2UpOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIC50aGVuKCgpID0+IHRoaXMuYXhpb3MuZ2V0KGAvJHtpdGVtLnR5cGV9LyR7aXRlbS5pZH1gKSlcbiAgICAudGhlbigocmVwbHkpID0+IHtcbiAgICAgIGlmIChyZXBseS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAocmVwbHkuc3RhdHVzICE9PSAyMDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlcGx5LnN0YXR1c1RleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVwbHkuZGF0YTtcbiAgICAgICAgaWYgKHJlc3VsdC5pbmNsdWRlZCkge1xuICAgICAgICAgIHJlc3VsdC5pbmNsdWRlZC5mb3JFYWNoKChpbmNsdWRlZERhdGEpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmlyZVJlYWRVcGRhdGUoaW5jbHVkZWREYXRhKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH0pXG4gICAgLy8gLnRoZW4oKHYpID0+IHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKHYpO1xuICAgIC8vICAgcmV0dXJuIHY7XG4gICAgLy8gfSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ3Byb21pc2UgcmVqZWN0aW9uIGluIHJlc3QnKTtcbiAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVhZFJlbGF0aW9uc2hpcCh2YWx1ZTogTW9kZWxSZWZlcmVuY2UsIHJlbE5hbWU6IHN0cmluZyk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZ2V0KGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfS8ke3JlbE5hbWV9YClcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZS5kYXRhLmluY2x1ZGVkKSB7XG4gICAgICAgIHJlc3BvbnNlLmRhdGEuaW5jbHVkZWQuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgIHRoaXMuZmlyZVJlYWRVcGRhdGUoaXRlbSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgaWYgKGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgd3JpdGVSZWxhdGlvbnNoaXBJdGVtKCB2YWx1ZTogTW9kZWxSZWZlcmVuY2UsIHJlbE5hbWU6IHN0cmluZywgY2hpbGQ6IHtpZDogc3RyaW5nIHwgbnVtYmVyfSApOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiB0aGlzLmF4aW9zLnB1dChgLyR7dmFsdWUudHlwZX0vJHt2YWx1ZS5pZH0vJHtyZWxOYW1lfWAsIGNoaWxkKVxuICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHsgdHlwZTogdmFsdWUudHlwZSwgaWQ6IHZhbHVlLmlkLCBpbnZhbGlkYXRlOiBbYHJlbGF0aW9uc2hpcHMuJHtyZWxOYW1lfWBdIH0pO1xuICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgZGVsZXRlUmVsYXRpb25zaGlwSXRlbSggdmFsdWU6IE1vZGVsUmVmZXJlbmNlLCByZWxOYW1lOiBzdHJpbmcsIGNoaWxkOiB7aWQ6IHN0cmluZyB8IG51bWJlcn0gKTogUHJvbWlzZTxNb2RlbERhdGE+IHtcbiAgICByZXR1cm4gdGhpcy5heGlvcy5kZWxldGUoYC8ke3ZhbHVlLnR5cGV9LyR7dmFsdWUuaWR9LyR7cmVsTmFtZX0vJHtjaGlsZC5pZH1gKVxuICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHsgdHlwZTogdmFsdWUudHlwZSwgaWQ6IHZhbHVlLmlkLCBpbnZhbGlkYXRlOiBbYHJlbGF0aW9uc2hpcHMuJHtyZWxOYW1lfWBdIH0pO1xuICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgZGVsZXRlKHZhbHVlOiBNb2RlbFJlZmVyZW5jZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmF4aW9zLmRlbGV0ZShgLyR7dmFsdWUudHlwZX0vJHt2YWx1ZS5pZH1gKVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICB0eXBlOiB2YWx1ZS50eXBlLFxuICAgICAgICBpZDogdmFsdWUuaWQsXG4gICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YXM7XG4gICAgfSk7XG4gIH1cblxuICBxdWVyeShxKSB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZ2V0KGAvJHtxLnR5cGV9YCwgeyBwYXJhbXM6IHEucXVlcnkgfSlcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
