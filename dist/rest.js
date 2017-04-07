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
            var result = response.data;
            _this.fireWriteUpdate({
                typeName: result.typeName,
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
        }).catch(function (err) {
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
        return this.axios.get("/" + value.typeName + "/" + value.id + "/" + relName)
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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SUFDTCxDQUFDO0lBRUQsMEJBQU0sR0FBTixVQUFPLEtBQXFCO1FBQTVCLGlCQVVDO1FBVEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQUksS0FBSyxDQUFDLFFBQVEsU0FBSSxLQUFLLENBQUMsRUFBSSxDQUFDO2FBQ3pELElBQUksQ0FBQyxVQUFDLFFBQVE7WUFDYixLQUFJLENBQUMsZUFBZSxDQUFDO2dCQUNuQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7Z0JBQ3hCLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDWixVQUFVLEVBQUUsQ0FBQyxZQUFZLENBQUM7YUFDM0IsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQseUJBQUssR0FBTCxVQUFNLENBQUM7UUFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBSSxDQUFDLENBQUMsSUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUN2RCxJQUFJLENBQUMsVUFBQyxRQUFRO1lBQ2IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0gsZ0JBQUM7QUFBRCxDQXJIQSxBQXFIQyxDQXJIOEIsZUFBTyxHQXFIckM7QUFySFksOEJBQVMiLCJmaWxlIjoicmVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBeGlvcywgeyBBeGlvc0luc3RhbmNlIH0gZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHsgU3RvcmFnZSwgU3RvcmFnZU9wdGlvbnMsIEluZGVmaW5pdGVNb2RlbERhdGEsIE1vZGVsRGF0YSwgTW9kZWxSZWZlcmVuY2UsIFRlcm1pbmFsU3RvcmUgfSBmcm9tICdwbHVtcCc7XG5cbmV4cG9ydCBjbGFzcyBSZXN0U3RvcmUgZXh0ZW5kcyBTdG9yYWdlIGltcGxlbWVudHMgVGVybWluYWxTdG9yZSB7XG4gIHByaXZhdGUgYXhpb3M7XG4gIGNvbnN0cnVjdG9yKG9wdHM6IFN0b3JhZ2VPcHRpb25zICYgeyBiYXNlVVJMPzogc3RyaW5nLCBheGlvcz86IEF4aW9zSW5zdGFuY2UgfSkge1xuICAgIHN1cGVyKG9wdHMpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICB7XG4gICAgICAgIGJhc2VVUkw6ICdodHRwOi8vbG9jYWxob3N0L2FwaScsXG4gICAgICB9LFxuICAgICAgb3B0c1xuICAgICk7XG5cbiAgICB0aGlzLmF4aW9zID0gb3B0aW9ucy5heGlvcyB8fCBBeGlvcy5jcmVhdGUob3B0aW9ucyk7XG4gIH1cblxuICB3cml0ZUF0dHJpYnV0ZXModmFsdWU6IEluZGVmaW5pdGVNb2RlbERhdGEpOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgIGlmICh2YWx1ZS5pZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5heGlvcy5wYXRjaChgLyR7dmFsdWUudHlwZU5hbWV9LyR7dmFsdWUuaWR9YCwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnRlcm1pbmFsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF4aW9zLnBvc3QoYC8ke3ZhbHVlLnR5cGVOYW1lfWAsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNyZWF0ZSBuZXcgY29udGVudCBpbiBhIG5vbi10ZXJtaW5hbCBzdG9yZScpO1xuICAgICAgfVxuICAgIH0pXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSByZXNwb25zZS5kYXRhO1xuICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICB0eXBlTmFtZTogcmVzdWx0LnR5cGVOYW1lLFxuICAgICAgICBpZDogcmVzdWx0LmlkLFxuICAgICAgICBpbnZhbGlkYXRlOiBbJ2F0dHJpYnV0ZXMnXSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcbiAgfVxuXG4gIHJlYWRBdHRyaWJ1dGVzKGl0ZW06IE1vZGVsUmVmZXJlbmNlKTogUHJvbWlzZTxNb2RlbERhdGE+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAudGhlbigoKSA9PiB0aGlzLmF4aW9zLmdldChgLyR7aXRlbS50eXBlTmFtZX0vJHtpdGVtLmlkfWApKVxuICAgIC50aGVuKChyZXBseSkgPT4ge1xuICAgICAgaWYgKHJlcGx5LnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIGlmIChyZXBseS5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVwbHkuc3RhdHVzVGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZXN1bHQgPSByZXBseS5kYXRhO1xuICAgICAgICBpZiAocmVzdWx0LmluY2x1ZGVkKSB7XG4gICAgICAgICAgcmVzdWx0LmluY2x1ZGVkLmZvckVhY2goKGluY2x1ZGVkRGF0YSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5maXJlUmVhZFVwZGF0ZShpbmNsdWRlZERhdGEpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ3Byb21pc2UgcmVqZWN0aW9uIGluIHJlc3QnKTtcbiAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVhZFJlbGF0aW9uc2hpcCh2YWx1ZTogTW9kZWxSZWZlcmVuY2UsIHJlbE5hbWU6IHN0cmluZyk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZ2V0KGAvJHt2YWx1ZS50eXBlTmFtZX0vJHt2YWx1ZS5pZH0vJHtyZWxOYW1lfWApXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAocmVzcG9uc2UuZGF0YS5pbmNsdWRlZCkge1xuICAgICAgICByZXNwb25zZS5kYXRhLmluY2x1ZGVkLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICB0aGlzLmZpcmVSZWFkVXBkYXRlKGl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHdyaXRlUmVsYXRpb25zaGlwSXRlbSggdmFsdWU6IE1vZGVsUmVmZXJlbmNlLCByZWxOYW1lOiBzdHJpbmcsIGNoaWxkOiB7aWQ6IHN0cmluZyB8IG51bWJlcn0gKTogUHJvbWlzZTxNb2RlbERhdGE+IHtcbiAgICByZXR1cm4gdGhpcy5heGlvcy5wdXQoYC8ke3ZhbHVlLnR5cGVOYW1lfS8ke3ZhbHVlLmlkfS8ke3JlbE5hbWV9YCwgY2hpbGQpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoeyB0eXBlTmFtZTogdmFsdWUudHlwZU5hbWUsIGlkOiB2YWx1ZS5pZCwgaW52YWxpZGF0ZTogW2ByZWxhdGlvbnNoaXBzLiR7cmVsTmFtZX1gXSB9KTtcbiAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlbGV0ZVJlbGF0aW9uc2hpcEl0ZW0oIHZhbHVlOiBNb2RlbFJlZmVyZW5jZSwgcmVsTmFtZTogc3RyaW5nLCBjaGlsZDoge2lkOiBzdHJpbmcgfCBudW1iZXJ9ICk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZGVsZXRlKGAvJHt2YWx1ZS50eXBlTmFtZX0vJHt2YWx1ZS5pZH0vJHtyZWxOYW1lfS8ke2NoaWxkLmlkfWApXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoeyB0eXBlTmFtZTogdmFsdWUudHlwZU5hbWUsIGlkOiB2YWx1ZS5pZCwgaW52YWxpZGF0ZTogW2ByZWxhdGlvbnNoaXBzLiR7cmVsTmFtZX1gXSB9KTtcbiAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlbGV0ZSh2YWx1ZTogTW9kZWxSZWZlcmVuY2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5heGlvcy5kZWxldGUoYC8ke3ZhbHVlLnR5cGVOYW1lfS8ke3ZhbHVlLmlkfWApXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICB0aGlzLmZpcmVXcml0ZVVwZGF0ZSh7XG4gICAgICAgIHR5cGVOYW1lOiB2YWx1ZS50eXBlTmFtZSxcbiAgICAgICAgaWQ6IHZhbHVlLmlkLFxuICAgICAgICBpbnZhbGlkYXRlOiBbJ2F0dHJpYnV0ZXMnXSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFzO1xuICAgIH0pO1xuICB9XG5cbiAgcXVlcnkocSkge1xuICAgIHJldHVybiB0aGlzLmF4aW9zLmdldChgLyR7cS50eXBlfWAsIHsgcGFyYW1zOiBxLnF1ZXJ5IH0pXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9KTtcbiAgfVxufVxuIl19
