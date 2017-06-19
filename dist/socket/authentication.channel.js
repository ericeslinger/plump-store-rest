"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_1 = require("./socket");
var ulid = require("ulid");
function testAuthentication(io, key) {
    return socket_1.rpc(io, 'authentication', {
        request: 'testkey',
        key: key,
    }).then(function (v) {
        return v.auth;
    });
}
exports.testAuthentication = testAuthentication;
function authenticate(io) {
    var nonce = ulid();
    return new Promise(function (resolve, reject) {
        io.once(nonce, function (result) {
            if (result.status === 'success') {
                resolve(result.token);
            }
            else {
                reject(result);
            }
        });
        io.emit('auth', { request: 'startauth', nonce: nonce });
    });
}
exports.authenticate = authenticate;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb2NrZXQvYXV0aGVudGljYXRpb24uY2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG1DQUErQjtBQUUvQiwyQkFBNkI7QUFFN0IsNEJBQ0UsRUFBeUIsRUFDekIsR0FBVztJQUVYLE1BQU0sQ0FBQyxZQUFHLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFO1FBQy9CLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLEdBQUcsRUFBRSxHQUFHO0tBQ1QsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQWU7UUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBVkQsZ0RBVUM7QUFFRCxzQkFBNkIsRUFBeUI7SUFDcEQsSUFBTSxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUM7SUFDckIsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07UUFDakMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsVUFBQSxNQUFNO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDaEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUMxRCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFaRCxvQ0FZQyIsImZpbGUiOiJzb2NrZXQvYXV0aGVudGljYXRpb24uY2hhbm5lbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFNvY2tldElPIGZyb20gJ3NvY2tldC5pby1jbGllbnQnO1xuaW1wb3J0IHsgcnBjIH0gZnJvbSAnLi9zb2NrZXQnO1xuaW1wb3J0IHsgVGVzdFJlc3BvbnNlIH0gZnJvbSAnLi9tZXNzYWdlSW50ZXJmYWNlcyc7XG5pbXBvcnQgKiBhcyB1bGlkIGZyb20gJ3VsaWQnO1xuXG5leHBvcnQgZnVuY3Rpb24gdGVzdEF1dGhlbnRpY2F0aW9uKFxuICBpbzogU29ja2V0SU9DbGllbnQuU29ja2V0LFxuICBrZXk6IHN0cmluZyxcbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXR1cm4gcnBjKGlvLCAnYXV0aGVudGljYXRpb24nLCB7XG4gICAgcmVxdWVzdDogJ3Rlc3RrZXknLFxuICAgIGtleToga2V5LFxuICB9KS50aGVuKCh2OiBUZXN0UmVzcG9uc2UpID0+IHtcbiAgICByZXR1cm4gdi5hdXRoO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1dGhlbnRpY2F0ZShpbzogU29ja2V0SU9DbGllbnQuU29ja2V0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3Qgbm9uY2UgPSB1bGlkKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaW8ub25jZShub25jZSwgcmVzdWx0ID0+IHtcbiAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnc3VjY2VzcycpIHtcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQudG9rZW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KHJlc3VsdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaW8uZW1pdCgnYXV0aCcsIHsgcmVxdWVzdDogJ3N0YXJ0YXV0aCcsIG5vbmNlOiBub25jZSB9KTtcbiAgfSk7XG59XG4iXX0=
