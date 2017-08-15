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
            return response.data;
        });
    };
    return RestStore;
}(plump_1.Storage));
exports.RestStore = RestStore;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLCtCQUE2QztBQUM3QywyQ0FBNkM7QUFHN0MsK0JBT2U7QUFTZjtJQUErQiw2QkFBTztJQUtwQyxtQkFBWSxJQUFpQjtRQUE3QixZQUNFLGtCQUFNLElBQUksQ0FBQyxTQWNaO1FBYkMsS0FBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUMxQixFQUFFLEVBQ0Y7WUFDRSxPQUFPLEVBQUUsc0JBQXNCO1NBQ2hDLEVBQ0QsSUFBSSxDQUNMLENBQUM7UUFFRixLQUFJLENBQUMsS0FBSyxHQUFHLEtBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlELEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMzQixLQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLEtBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFsQyxDQUFrQyxDQUFDLENBQUM7UUFDbEUsQ0FBQzs7SUFDSCxDQUFDO0lBRUQsbUNBQWUsR0FBZixVQUFnQixLQUEwQjtRQUExQyxpQkFvQkM7UUFuQkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7YUFDckIsSUFBSSxDQUFDO1lBQ0osRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsTUFBTSxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQUksS0FBSyxDQUFDLElBQUksU0FBSSxLQUFLLENBQUMsRUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQy9ELENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLE1BQU0sQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFJLEtBQUssQ0FBQyxJQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbEQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQztZQUN2RSxDQUFDO1FBQ0gsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLFVBQUEsUUFBUTtZQUNaLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDN0IsS0FBSSxDQUFDLGVBQWUsQ0FBQztnQkFDbkIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO2dCQUNqQixFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ2IsVUFBVSxFQUFFLENBQUMsWUFBWSxDQUFDO2FBQzNCLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsa0NBQWMsR0FBZCxVQUFlLElBQW9CO1FBQW5DLGlCQXlCQztRQXhCQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTthQUNyQixJQUFJLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQUksSUFBSSxDQUFDLElBQUksU0FBSSxJQUFJLENBQUMsRUFBSSxDQUFDLEVBQTFDLENBQTBDLENBQUM7YUFDdEQsSUFBSSxDQUFDLFVBQUEsS0FBSztZQUNULEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNkLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwQyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDMUIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsWUFBWTt3QkFDbEMsS0FBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDcEMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ2hCLENBQUM7UUFDSCxDQUFDLENBQUM7YUFDRCxLQUFLLENBQUMsVUFBQSxHQUFHO1lBQ1IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE1BQU0sR0FBRyxDQUFDO1lBQ1osQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELG9DQUFnQixHQUFoQixVQUFpQixLQUFxQixFQUFFLE9BQWU7UUFBdkQsaUJBa0JDO1FBakJDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSzthQUNkLEdBQUcsQ0FBQyxNQUFJLEtBQUssQ0FBQyxJQUFJLFNBQUksS0FBSyxDQUFDLEVBQUUsU0FBSSxPQUFTLENBQUM7YUFDNUMsSUFBSSxDQUFDLFVBQUEsUUFBUTtZQUNaLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDM0IsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtvQkFDakMsS0FBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUIsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDdkIsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLFVBQUEsR0FBRztZQUNSLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDaEQsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNaLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLEdBQUcsQ0FBQztZQUNaLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCx5Q0FBcUIsR0FBckIsVUFDRSxLQUFxQixFQUNyQixPQUFlLEVBQ2YsS0FBOEI7UUFIaEMsaUJBZUM7UUFWQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUs7YUFDZCxHQUFHLENBQUMsTUFBSSxLQUFLLENBQUMsSUFBSSxTQUFJLEtBQUssQ0FBQyxFQUFFLFNBQUksT0FBUyxFQUFFLEtBQUssQ0FBQzthQUNuRCxJQUFJLENBQUMsVUFBQSxHQUFHO1lBQ1AsS0FBSSxDQUFDLGVBQWUsQ0FBQztnQkFDbkIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO2dCQUNoQixFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ1osVUFBVSxFQUFFLENBQUMsbUJBQWlCLE9BQVMsQ0FBQzthQUN6QyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCwwQ0FBc0IsR0FBdEIsVUFDRSxLQUFxQixFQUNyQixPQUFlLEVBQ2YsS0FBOEI7UUFIaEMsaUJBZUM7UUFWQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUs7YUFDZCxNQUFNLENBQUMsTUFBSSxLQUFLLENBQUMsSUFBSSxTQUFJLEtBQUssQ0FBQyxFQUFFLFNBQUksT0FBTyxTQUFJLEtBQUssQ0FBQyxFQUFJLENBQUM7YUFDM0QsSUFBSSxDQUFDLFVBQUEsR0FBRztZQUNQLEtBQUksQ0FBQyxlQUFlLENBQUM7Z0JBQ25CLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtnQkFDaEIsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUNaLFVBQVUsRUFBRSxDQUFDLG1CQUFpQixPQUFTLENBQUM7YUFDekMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsMEJBQU0sR0FBTixVQUFPLEtBQXFCO1FBQTVCLGlCQVNDO1FBUkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQUksS0FBSyxDQUFDLElBQUksU0FBSSxLQUFLLENBQUMsRUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsUUFBUTtZQUNsRSxLQUFJLENBQUMsZUFBZSxDQUFDO2dCQUNuQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7Z0JBQ2hCLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDWixVQUFVLEVBQUUsQ0FBQyxZQUFZLENBQUM7YUFDM0IsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQseUJBQUssR0FBTCxVQUFNLElBQVksRUFBRSxDQUFNO1FBQTFCLGlCQVNDO1FBUkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQUksSUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsUUFBUTtZQUM1RCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7b0JBQ2pDLEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVCLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNILGdCQUFDO0FBQUQsQ0FsSkEsQUFrSkMsQ0FsSjhCLGVBQU8sR0FrSnJDO0FBbEpZLDhCQUFTIiwiZmlsZSI6InJlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXhpb3MsIHsgQXhpb3NJbnN0YW5jZSB9IGZyb20gJ2F4aW9zJztcbmltcG9ydCAqIGFzIFNvY2tldElPIGZyb20gJ3NvY2tldC5pby1jbGllbnQnO1xuaW1wb3J0IHsgdGVzdEF1dGhlbnRpY2F0aW9uIH0gZnJvbSAnLi9zb2NrZXQvYXV0aGVudGljYXRpb24uY2hhbm5lbCc7XG5cbmltcG9ydCB7XG4gIFN0b3JhZ2UsXG4gIFN0b3JhZ2VPcHRpb25zLFxuICBJbmRlZmluaXRlTW9kZWxEYXRhLFxuICBNb2RlbERhdGEsXG4gIE1vZGVsUmVmZXJlbmNlLFxuICBUZXJtaW5hbFN0b3JlLFxufSBmcm9tICdwbHVtcCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzdE9wdGlvbnMgZXh0ZW5kcyBTdG9yYWdlT3B0aW9ucyB7XG4gIGJhc2VVUkw/OiBzdHJpbmc7XG4gIGF4aW9zPzogQXhpb3NJbnN0YW5jZTtcbiAgc29ja2V0VVJMPzogc3RyaW5nO1xuICBhcGlLZXk/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBSZXN0U3RvcmUgZXh0ZW5kcyBTdG9yYWdlIGltcGxlbWVudHMgVGVybWluYWxTdG9yZSB7XG4gIHB1YmxpYyBheGlvczogQXhpb3NJbnN0YW5jZTtcbiAgcHVibGljIGlvOiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQ7XG4gIHByaXZhdGUgb3B0aW9uczogUmVzdE9wdGlvbnM7XG4gIHByaXZhdGUgX2Rpc3BhdGNoaW5nOiBQcm9taXNlPGJvb2xlYW4+O1xuICBjb25zdHJ1Y3RvcihvcHRzOiBSZXN0T3B0aW9ucykge1xuICAgIHN1cGVyKG9wdHMpO1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7fSxcbiAgICAgIHtcbiAgICAgICAgYmFzZVVSTDogJ2h0dHA6Ly9sb2NhbGhvc3QvYXBpJyxcbiAgICAgIH0sXG4gICAgICBvcHRzLFxuICAgICk7XG5cbiAgICB0aGlzLmF4aW9zID0gdGhpcy5vcHRpb25zLmF4aW9zIHx8IEF4aW9zLmNyZWF0ZSh0aGlzLm9wdGlvbnMpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuc29ja2V0VVJMKSB7XG4gICAgICB0aGlzLmlvID0gU29ja2V0SU8odGhpcy5vcHRpb25zLnNvY2tldFVSTCk7XG4gICAgICB0aGlzLmlvLm9uKCdjb25uZWN0JywgKCkgPT4gY29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byBzb2NrZXQnKSk7XG4gICAgfVxuICB9XG5cbiAgd3JpdGVBdHRyaWJ1dGVzKHZhbHVlOiBJbmRlZmluaXRlTW9kZWxEYXRhKTogUHJvbWlzZTxNb2RlbERhdGE+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKHZhbHVlLmlkKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYXhpb3MucGF0Y2goYC8ke3ZhbHVlLnR5cGV9LyR7dmFsdWUuaWR9YCwgdmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudGVybWluYWwpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5heGlvcy5wb3N0KGAvJHt2YWx1ZS50eXBlfWAsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjcmVhdGUgbmV3IGNvbnRlbnQgaW4gYSBub24tdGVybWluYWwgc3RvcmUnKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICAgIHR5cGU6IHJlc3VsdC50eXBlLFxuICAgICAgICAgIGlkOiByZXN1bHQuaWQsXG4gICAgICAgICAgaW52YWxpZGF0ZTogWydhdHRyaWJ1dGVzJ10sXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gIH1cblxuICByZWFkQXR0cmlidXRlcyhpdGVtOiBNb2RlbFJlZmVyZW5jZSk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLmF4aW9zLmdldChgLyR7aXRlbS50eXBlfS8ke2l0ZW0uaWR9YCkpXG4gICAgICAudGhlbihyZXBseSA9PiB7XG4gICAgICAgIGlmIChyZXBseS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHJlcGx5LnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlcGx5LnN0YXR1c1RleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlcGx5LmRhdGE7XG4gICAgICAgICAgaWYgKHJlc3VsdC5pbmNsdWRlZCkge1xuICAgICAgICAgICAgcmVzdWx0LmluY2x1ZGVkLmZvckVhY2goaW5jbHVkZWREYXRhID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5maXJlUmVhZFVwZGF0ZShpbmNsdWRlZERhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgaWYgKGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgcmVhZFJlbGF0aW9uc2hpcCh2YWx1ZTogTW9kZWxSZWZlcmVuY2UsIHJlbE5hbWU6IHN0cmluZyk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3NcbiAgICAgIC5nZXQoYC8ke3ZhbHVlLnR5cGV9LyR7dmFsdWUuaWR9LyR7cmVsTmFtZX1gKVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2UuZGF0YS5pbmNsdWRlZCkge1xuICAgICAgICAgIHJlc3BvbnNlLmRhdGEuaW5jbHVkZWQuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmlyZVJlYWRVcGRhdGUoaXRlbSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICB3cml0ZVJlbGF0aW9uc2hpcEl0ZW0oXG4gICAgdmFsdWU6IE1vZGVsUmVmZXJlbmNlLFxuICAgIHJlbE5hbWU6IHN0cmluZyxcbiAgICBjaGlsZDogeyBpZDogc3RyaW5nIHwgbnVtYmVyIH0sXG4gICk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3NcbiAgICAgIC5wdXQoYC8ke3ZhbHVlLnR5cGV9LyR7dmFsdWUuaWR9LyR7cmVsTmFtZX1gLCBjaGlsZClcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICB0eXBlOiB2YWx1ZS50eXBlLFxuICAgICAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICAgICAgICBpbnZhbGlkYXRlOiBbYHJlbGF0aW9uc2hpcHMuJHtyZWxOYW1lfWBdLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgfSk7XG4gIH1cblxuICBkZWxldGVSZWxhdGlvbnNoaXBJdGVtKFxuICAgIHZhbHVlOiBNb2RlbFJlZmVyZW5jZSxcbiAgICByZWxOYW1lOiBzdHJpbmcsXG4gICAgY2hpbGQ6IHsgaWQ6IHN0cmluZyB8IG51bWJlciB9LFxuICApOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiB0aGlzLmF4aW9zXG4gICAgICAuZGVsZXRlKGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfS8ke3JlbE5hbWV9LyR7Y2hpbGQuaWR9YClcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICB0eXBlOiB2YWx1ZS50eXBlLFxuICAgICAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICAgICAgICBpbnZhbGlkYXRlOiBbYHJlbGF0aW9uc2hpcHMuJHtyZWxOYW1lfWBdLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgfSk7XG4gIH1cblxuICBkZWxldGUodmFsdWU6IE1vZGVsUmVmZXJlbmNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZGVsZXRlKGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfWApLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICB0eXBlOiB2YWx1ZS50eXBlLFxuICAgICAgICBpZDogdmFsdWUuaWQsXG4gICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9KTtcbiAgfVxuXG4gIHF1ZXJ5KHR5cGU6IHN0cmluZywgcTogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZ2V0KGAvJHt0eXBlfWAsIHsgcGFyYW1zOiBxIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgaWYgKHJlc3BvbnNlLmRhdGEuaW5jbHVkZWQpIHtcbiAgICAgICAgcmVzcG9uc2UuZGF0YS5pbmNsdWRlZC5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgIHRoaXMuZmlyZVJlYWRVcGRhdGUoaXRlbSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
