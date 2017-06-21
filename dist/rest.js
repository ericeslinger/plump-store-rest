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
var authentication_channel_1 = require("./socket/authentication.channel");
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
    RestStore.prototype.initialize = function () {
        return authentication_channel_1.testAuthentication(this.io, this.options.apiKey)
            .then(function (v) {
            console.log("AUTHENTICATION TOKEN TESTED: " + v);
        })
            .catch(function (err) {
            console.log('autherr', err);
        });
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
    RestStore.prototype.query = function (q) {
        return this.axios.get("/" + q.type, { params: q.query }).then(function (response) {
            return response.data;
        });
    };
    return RestStore;
}(plump_1.Storage));
exports.RestStore = RestStore;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLCtCQUE2QztBQUM3QywyQ0FBNkM7QUFDN0MsMEVBQXFFO0FBRXJFLCtCQU9lO0FBU2Y7SUFBK0IsNkJBQU87SUFJcEMsbUJBQVksSUFBaUI7UUFBN0IsWUFDRSxrQkFBTSxJQUFJLENBQUMsU0FjWjtRQWJDLEtBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FDMUIsRUFBRSxFQUNGO1lBQ0UsT0FBTyxFQUFFLHNCQUFzQjtTQUNoQyxFQUNELElBQUksQ0FDTCxDQUFDO1FBRUYsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5RCxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsS0FBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQyxLQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsRUFBbEMsQ0FBa0MsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7O0lBQ0gsQ0FBQztJQUVELDhCQUFVLEdBQVY7UUFDRSxNQUFNLENBQUMsMkNBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzthQUNwRCxJQUFJLENBQUMsVUFBQSxDQUFDO1lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBZ0MsQ0FBRyxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLFVBQUEsR0FBRztZQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELG1DQUFlLEdBQWYsVUFBZ0IsS0FBMEI7UUFBMUMsaUJBb0JDO1FBbkJDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO2FBQ3JCLElBQUksQ0FBQztZQUNKLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNiLE1BQU0sQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFJLEtBQUssQ0FBQyxJQUFJLFNBQUksS0FBSyxDQUFDLEVBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMvRCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixNQUFNLENBQUMsS0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBSSxLQUFLLENBQUMsSUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLElBQUksS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7WUFDdkUsQ0FBQztRQUNILENBQUMsQ0FBQzthQUNELElBQUksQ0FBQyxVQUFBLFFBQVE7WUFDWixJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQzdCLEtBQUksQ0FBQyxlQUFlLENBQUM7Z0JBQ25CLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtnQkFDakIsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUNiLFVBQVUsRUFBRSxDQUFDLFlBQVksQ0FBQzthQUMzQixDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGtDQUFjLEdBQWQsVUFBZSxJQUFvQjtRQUFuQyxpQkF5QkM7UUF4QkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7YUFDckIsSUFBSSxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFJLElBQUksQ0FBQyxJQUFJLFNBQUksSUFBSSxDQUFDLEVBQUksQ0FBQyxFQUExQyxDQUEwQyxDQUFDO2FBQ3RELElBQUksQ0FBQyxVQUFBLEtBQUs7WUFDVCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLElBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQzFCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNwQixNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFlBQVk7d0JBQ2xDLEtBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3BDLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNoQixDQUFDO1FBQ0gsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLFVBQUEsR0FBRztZQUNSLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNkLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLEdBQUcsQ0FBQztZQUNaLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxvQ0FBZ0IsR0FBaEIsVUFBaUIsS0FBcUIsRUFBRSxPQUFlO1FBQXZELGlCQWtCQztRQWpCQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUs7YUFDZCxHQUFHLENBQUMsTUFBSSxLQUFLLENBQUMsSUFBSSxTQUFJLEtBQUssQ0FBQyxFQUFFLFNBQUksT0FBUyxDQUFDO2FBQzVDLElBQUksQ0FBQyxVQUFBLFFBQVE7WUFDWixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7b0JBQ2pDLEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVCLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQzthQUNELEtBQUssQ0FBQyxVQUFBLEdBQUc7WUFDUixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDWixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sTUFBTSxHQUFHLENBQUM7WUFDWixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQseUNBQXFCLEdBQXJCLFVBQ0UsS0FBcUIsRUFDckIsT0FBZSxFQUNmLEtBQThCO1FBSGhDLGlCQWVDO1FBVkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLO2FBQ2QsR0FBRyxDQUFDLE1BQUksS0FBSyxDQUFDLElBQUksU0FBSSxLQUFLLENBQUMsRUFBRSxTQUFJLE9BQVMsRUFBRSxLQUFLLENBQUM7YUFDbkQsSUFBSSxDQUFDLFVBQUEsR0FBRztZQUNQLEtBQUksQ0FBQyxlQUFlLENBQUM7Z0JBQ25CLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtnQkFDaEIsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUNaLFVBQVUsRUFBRSxDQUFDLG1CQUFpQixPQUFTLENBQUM7YUFDekMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsMENBQXNCLEdBQXRCLFVBQ0UsS0FBcUIsRUFDckIsT0FBZSxFQUNmLEtBQThCO1FBSGhDLGlCQWVDO1FBVkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLO2FBQ2QsTUFBTSxDQUFDLE1BQUksS0FBSyxDQUFDLElBQUksU0FBSSxLQUFLLENBQUMsRUFBRSxTQUFJLE9BQU8sU0FBSSxLQUFLLENBQUMsRUFBSSxDQUFDO2FBQzNELElBQUksQ0FBQyxVQUFBLEdBQUc7WUFDUCxLQUFJLENBQUMsZUFBZSxDQUFDO2dCQUNuQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7Z0JBQ2hCLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDWixVQUFVLEVBQUUsQ0FBQyxtQkFBaUIsT0FBUyxDQUFDO2FBQ3pDLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELDBCQUFNLEdBQU4sVUFBTyxLQUFxQjtRQUE1QixpQkFTQztRQVJDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFJLEtBQUssQ0FBQyxJQUFJLFNBQUksS0FBSyxDQUFDLEVBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLFFBQVE7WUFDbEUsS0FBSSxDQUFDLGVBQWUsQ0FBQztnQkFDbkIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO2dCQUNoQixFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ1osVUFBVSxFQUFFLENBQUMsWUFBWSxDQUFDO2FBQzNCLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHlCQUFLLEdBQUwsVUFBTSxDQUFDO1FBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQUksQ0FBQyxDQUFDLElBQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxRQUFRO1lBQ3BFLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNILGdCQUFDO0FBQUQsQ0F0SkEsQUFzSkMsQ0F0SjhCLGVBQU8sR0FzSnJDO0FBdEpZLDhCQUFTIiwiZmlsZSI6InJlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXhpb3MsIHsgQXhpb3NJbnN0YW5jZSB9IGZyb20gJ2F4aW9zJztcbmltcG9ydCAqIGFzIFNvY2tldElPIGZyb20gJ3NvY2tldC5pby1jbGllbnQnO1xuaW1wb3J0IHsgdGVzdEF1dGhlbnRpY2F0aW9uIH0gZnJvbSAnLi9zb2NrZXQvYXV0aGVudGljYXRpb24uY2hhbm5lbCc7XG5cbmltcG9ydCB7XG4gIFN0b3JhZ2UsXG4gIFN0b3JhZ2VPcHRpb25zLFxuICBJbmRlZmluaXRlTW9kZWxEYXRhLFxuICBNb2RlbERhdGEsXG4gIE1vZGVsUmVmZXJlbmNlLFxuICBUZXJtaW5hbFN0b3JlLFxufSBmcm9tICdwbHVtcCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzdE9wdGlvbnMgZXh0ZW5kcyBTdG9yYWdlT3B0aW9ucyB7XG4gIGJhc2VVUkw/OiBzdHJpbmc7XG4gIGF4aW9zPzogQXhpb3NJbnN0YW5jZTtcbiAgc29ja2V0VVJMPzogc3RyaW5nO1xuICBhcGlLZXk/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBSZXN0U3RvcmUgZXh0ZW5kcyBTdG9yYWdlIGltcGxlbWVudHMgVGVybWluYWxTdG9yZSB7XG4gIHB1YmxpYyBheGlvczogQXhpb3NJbnN0YW5jZTtcbiAgcHVibGljIGlvOiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQ7XG4gIHByaXZhdGUgb3B0aW9uczogUmVzdE9wdGlvbnM7XG4gIGNvbnN0cnVjdG9yKG9wdHM6IFJlc3RPcHRpb25zKSB7XG4gICAgc3VwZXIob3B0cyk7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBiYXNlVVJMOiAnaHR0cDovL2xvY2FsaG9zdC9hcGknLFxuICAgICAgfSxcbiAgICAgIG9wdHMsXG4gICAgKTtcblxuICAgIHRoaXMuYXhpb3MgPSB0aGlzLm9wdGlvbnMuYXhpb3MgfHwgQXhpb3MuY3JlYXRlKHRoaXMub3B0aW9ucyk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zb2NrZXRVUkwpIHtcbiAgICAgIHRoaXMuaW8gPSBTb2NrZXRJTyh0aGlzLm9wdGlvbnMuc29ja2V0VVJMKTtcbiAgICAgIHRoaXMuaW8ub24oJ2Nvbm5lY3QnLCAoKSA9PiBjb25zb2xlLmxvZygnY29ubmVjdGVkIHRvIHNvY2tldCcpKTtcbiAgICB9XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHJldHVybiB0ZXN0QXV0aGVudGljYXRpb24odGhpcy5pbywgdGhpcy5vcHRpb25zLmFwaUtleSlcbiAgICAgIC50aGVuKHYgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgQVVUSEVOVElDQVRJT04gVE9LRU4gVEVTVEVEOiAke3Z9YCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhdXRoZXJyJywgZXJyKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgd3JpdGVBdHRyaWJ1dGVzKHZhbHVlOiBJbmRlZmluaXRlTW9kZWxEYXRhKTogUHJvbWlzZTxNb2RlbERhdGE+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKHZhbHVlLmlkKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYXhpb3MucGF0Y2goYC8ke3ZhbHVlLnR5cGV9LyR7dmFsdWUuaWR9YCwgdmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudGVybWluYWwpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5heGlvcy5wb3N0KGAvJHt2YWx1ZS50eXBlfWAsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjcmVhdGUgbmV3IGNvbnRlbnQgaW4gYSBub24tdGVybWluYWwgc3RvcmUnKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICAgIHR5cGU6IHJlc3VsdC50eXBlLFxuICAgICAgICAgIGlkOiByZXN1bHQuaWQsXG4gICAgICAgICAgaW52YWxpZGF0ZTogWydhdHRyaWJ1dGVzJ10sXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gIH1cblxuICByZWFkQXR0cmlidXRlcyhpdGVtOiBNb2RlbFJlZmVyZW5jZSk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLmF4aW9zLmdldChgLyR7aXRlbS50eXBlfS8ke2l0ZW0uaWR9YCkpXG4gICAgICAudGhlbihyZXBseSA9PiB7XG4gICAgICAgIGlmIChyZXBseS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHJlcGx5LnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlcGx5LnN0YXR1c1RleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlcGx5LmRhdGE7XG4gICAgICAgICAgaWYgKHJlc3VsdC5pbmNsdWRlZCkge1xuICAgICAgICAgICAgcmVzdWx0LmluY2x1ZGVkLmZvckVhY2goaW5jbHVkZWREYXRhID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5maXJlUmVhZFVwZGF0ZShpbmNsdWRlZERhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgaWYgKGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgcmVhZFJlbGF0aW9uc2hpcCh2YWx1ZTogTW9kZWxSZWZlcmVuY2UsIHJlbE5hbWU6IHN0cmluZyk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3NcbiAgICAgIC5nZXQoYC8ke3ZhbHVlLnR5cGV9LyR7dmFsdWUuaWR9LyR7cmVsTmFtZX1gKVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2UuZGF0YS5pbmNsdWRlZCkge1xuICAgICAgICAgIHJlc3BvbnNlLmRhdGEuaW5jbHVkZWQuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmlyZVJlYWRVcGRhdGUoaXRlbSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICB3cml0ZVJlbGF0aW9uc2hpcEl0ZW0oXG4gICAgdmFsdWU6IE1vZGVsUmVmZXJlbmNlLFxuICAgIHJlbE5hbWU6IHN0cmluZyxcbiAgICBjaGlsZDogeyBpZDogc3RyaW5nIHwgbnVtYmVyIH0sXG4gICk6IFByb21pc2U8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3NcbiAgICAgIC5wdXQoYC8ke3ZhbHVlLnR5cGV9LyR7dmFsdWUuaWR9LyR7cmVsTmFtZX1gLCBjaGlsZClcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICB0eXBlOiB2YWx1ZS50eXBlLFxuICAgICAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICAgICAgICBpbnZhbGlkYXRlOiBbYHJlbGF0aW9uc2hpcHMuJHtyZWxOYW1lfWBdLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgfSk7XG4gIH1cblxuICBkZWxldGVSZWxhdGlvbnNoaXBJdGVtKFxuICAgIHZhbHVlOiBNb2RlbFJlZmVyZW5jZSxcbiAgICByZWxOYW1lOiBzdHJpbmcsXG4gICAgY2hpbGQ6IHsgaWQ6IHN0cmluZyB8IG51bWJlciB9LFxuICApOiBQcm9taXNlPE1vZGVsRGF0YT4ge1xuICAgIHJldHVybiB0aGlzLmF4aW9zXG4gICAgICAuZGVsZXRlKGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfS8ke3JlbE5hbWV9LyR7Y2hpbGQuaWR9YClcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIHRoaXMuZmlyZVdyaXRlVXBkYXRlKHtcbiAgICAgICAgICB0eXBlOiB2YWx1ZS50eXBlLFxuICAgICAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICAgICAgICBpbnZhbGlkYXRlOiBbYHJlbGF0aW9uc2hpcHMuJHtyZWxOYW1lfWBdLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgfSk7XG4gIH1cblxuICBkZWxldGUodmFsdWU6IE1vZGVsUmVmZXJlbmNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuYXhpb3MuZGVsZXRlKGAvJHt2YWx1ZS50eXBlfS8ke3ZhbHVlLmlkfWApLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgdGhpcy5maXJlV3JpdGVVcGRhdGUoe1xuICAgICAgICB0eXBlOiB2YWx1ZS50eXBlLFxuICAgICAgICBpZDogdmFsdWUuaWQsXG4gICAgICAgIGludmFsaWRhdGU6IFsnYXR0cmlidXRlcyddLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9KTtcbiAgfVxuXG4gIHF1ZXJ5KHEpIHtcbiAgICByZXR1cm4gdGhpcy5heGlvcy5nZXQoYC8ke3EudHlwZX1gLCB7IHBhcmFtczogcS5xdWVyeSB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
