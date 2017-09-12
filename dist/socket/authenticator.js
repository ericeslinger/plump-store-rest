"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ulid = require("ulid");
var rxjs_1 = require("rxjs");
var Authenticator = (function () {
    function Authenticator(store) {
        var _this = this;
        this.store = store;
        this._key$ = new rxjs_1.BehaviorSubject(null);
        this._state$ = new rxjs_1.BehaviorSubject('untested');
        this._method$ = new rxjs_1.Subject();
        this._you$ = new rxjs_1.Subject();
        this.state$ = this._state$.asObservable();
        this.key$ = this._key$.asObservable();
        this.method$ = this._method$.asObservable();
        this.you$ = this._you$.asObservable();
        this.nonce = ulid();
        this.store.io.on(this.nonce, function (msg) {
            console.log(msg);
            switch (msg.response) {
                case 'token':
                    return _this.dispatchToken(msg);
                case 'startauth':
                    return _this.dispatchStart(msg);
                case 'invalidRequest':
                    return _this.dispatchInvalid(msg);
                case 'testkey':
                    return _this.dispatchTestKey(msg);
            }
        });
    }
    Authenticator.prototype.dispatchToken = function (msg) {
        if (msg.status === 'success') {
            this._state$.next('testing');
            this.attemptKey(msg.token);
        }
    };
    Authenticator.prototype.dispatchStart = function (msg) {
        this._method$.next(msg.types);
    };
    Authenticator.prototype.dispatchInvalid = function (msg) {
        this._state$.next('error');
        console.log('Error - invalid authentication channel message sent');
        console.log(msg);
    };
    Authenticator.prototype.dispatchTestKey = function (msg) {
        var _this = this;
        if (msg.auth === true) {
            this.store.axios.defaults.headers.common['Authorization'] = "Bearer " + msg.token;
            this._key$.next(msg.token);
            if (msg.you) {
                this._you$.next(msg.you);
            }
            if (msg.included) {
                msg.included.forEach(function (val) { return _this.store.fireReadUpdate(val); });
            }
            this._state$.next('ready');
        }
        else {
            console.log('invalid key');
            this.initiateLogin();
        }
    };
    Authenticator.prototype.attemptKey = function (k) {
        this._state$.next('testing');
        var req = {
            request: 'testkey',
            key: k,
            responseKey: this.nonce,
        };
        this.store.io.emit('auth', req);
    };
    Authenticator.prototype.initiateLogin = function () {
        this._state$.next('invalid');
        var req = {
            request: 'startauth',
            nonce: this.nonce,
            responseKey: this.nonce,
        };
        this.store.io.emit('auth', req);
    };
    return Authenticator;
}());
exports.Authenticator = Authenticator;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb2NrZXQvYXV0aGVudGljYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJCQUE2QjtBQUM3Qiw2QkFBNEQ7QUFvQjVEO0lBaUJFLHVCQUFtQixLQUFnQjtRQUFuQyxpQkFtQkM7UUFuQmtCLFVBQUssR0FBTCxLQUFLLENBQVc7UUFUM0IsVUFBSyxHQUFvQixJQUFJLHNCQUFlLENBQVMsSUFBSSxDQUFDLENBQUM7UUFDM0QsWUFBTyxHQUFpQyxJQUFJLHNCQUFlLENBRWpFLFVBQVUsQ0FBQyxDQUFDO1FBQ04sYUFBUSxHQUFrQyxJQUFJLGNBQU8sRUFFMUQsQ0FBQztRQUNJLFVBQUssR0FBaUIsSUFBSSxjQUFPLEVBQU8sQ0FBQztRQUcvQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFDLEdBQTJCO1lBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLEtBQUssT0FBTztvQkFDVixNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakMsS0FBSyxXQUFXO29CQUNkLE1BQU0sQ0FBQyxL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LE9BQU8sRUFBRSxXQUFXO1lBQ3BCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUs7U0FDeEIsQ0FBQztRQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNILG9CQUFDO0FBQUQsQ0E5RkEsQUE4RkMsSUFBQTtBQTlGWSxzQ0FBYSIsImZpbGUiOiJzb2NrZXQvYXV0aGVudGljYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHVsaWQgZnJvbSAndWxpZCc7XG5pbXBvcnQgeyBTdWJqZWN0LCBPYnNlcnZhYmxlLCBCZWhhdmlvclN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFJlc3RTdG9yZSB9IGZyb20gJy4uL3Jlc3QnO1xuaW1wb3J0IHsgcnBjIH0gZnJvbSAnLi9zb2NrZXQnO1xuaW1wb3J0IHtcbiAgVGVzdEtleUF1dGhlbnRpY2F0aW9uUmVxdWVzdCxcbiAgU3RhcnRBdXRoZW50aWNhdGlvblJlcXVlc3QsXG4gIFN0YXJ0UmVzcG9uc2UsXG4gIFRva2VuUmVzcG9uc2UsXG4gIFRlc3RSZXNwb25zZSxcbiAgQXV0aGVudGljYXRpb25SZXNwb25zZSxcbiAgQXV0aGVudGljYXRpb25UeXBlLFxufSBmcm9tICcuL21lc3NhZ2VJbnRlcmZhY2VzJztcblxuZXhwb3J0IHR5cGUgQXV0aGVudGljYXRvclN0YXRlcyA9XG4gIHwgJ3JlYWR5J1xuICB8ICd1bnRlc3RlZCdcbiAgfCAnZXJyb3InXG4gIHwgJ3Rlc3RpbmcnXG4gIHwgJ2ludmFsaWQnO1xuXG5leHBvcnQgY2xhc3MgQXV0aGVudGljYXRvciB7XG4gIHB1YmxpYyBub25jZTogc3RyaW5nO1xuXG4gIHB1YmxpYyBrZXkkOiBPYnNlcnZhYmxlPHN0cmluZz47XG4gIHB1YmxpYyBzdGF0ZSQ6IE9ic2VydmFibGU8QXV0aGVudGljYXRvclN0YXRlcz47XG4gIHB1YmxpYyBtZXRob2QkOiBPYnNlcnZhYmxlPEF1dGhlbnRpY2F0aW9uVHlwZVtdPjtcbiAgcHVibGljIHlvdSQ6IE9ic2VydmFibGU8YW55PjtcblxuICBwcml2YXRlIF9rZXkkOiBTdWJqZWN0PHN0cmluZz4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0PHN0cmluZz4obnVsbCk7XG4gIHByaXZhdGUgX3N0YXRlJDogU3ViamVjdDxBdXRoZW50aWNhdG9yU3RhdGVzPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8XG4gICAgQXV0aGVudGljYXRvclN0YXRlc1xuICA+KCd1bnRlc3RlZCcpO1xuICBwcml2YXRlIF9tZXRob2QkOiBTdWJqZWN0PEF1dGhlbnRpY2F0aW9uVHlwZVtdPiA9IG5ldyBTdWJqZWN0PFxuICAgIEF1dGhlbnRpY2F0aW9uVHlwZVtdXG4gID4oKTtcbiAgcHJpdmF0ZSBfeW91JDogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3Q8YW55PigpO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdG9yZTogUmVzdFN0b3JlKSB7XG4gICAgdGhpcy5zdGF0ZSQgPSB0aGlzLl9zdGF0ZSQuYXNPYnNlcnZhYmxlKCk7XG4gICAgdGhpcy5rZXkkID0gdGhpcy5fa2V5JC5hc09ic2VydmFibGUoKTtcbiAgICB0aGlzLm1ldGhvZCQgPSB0aGlzLl9tZXRob2QkLmFzT2JzZXJ2YWJsZSgpO1xuICAgIHRoaXMueW91JCA9IHRoaXMuX3lvdSQuYXNPYnNlcnZhYmxlKCk7XG4gICAgdGhpcy5ub25jZSA9IHVsaWQoKTtcbiAgICB0aGlzLnN0b3JlLmlvLm9uKHRoaXMubm9uY2UsIChtc2c6IEF1dGhlbnRpY2F0aW9uUmVzcG9uc2UpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICBzd2l0Y2ggKG1zZy5yZXNwb25zZSkge1xuICAgICAgICBjYXNlICd0b2tlbic6XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hUb2tlbihtc2cpO1xuICAgICAgICBjYXNlICdzdGFydGF1dGgnOlxuICAgICAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoU3RhcnQobXNnKTtcbiAgICAgICAgY2FzZSAnaW52YWxpZFJlcXVlc3QnOlxuICAgICAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoSW52YWxpZChtc2cpO1xuICAgICAgICBjYXNlICd0ZXN0a2V5JzpcbiAgICAgICAgICByZXR1cm4gdGhpcy5kaXNwYXRjaFRlc3RLZXkobXNnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRpc3BhdGNoVG9rZW4obXNnOiBUb2tlblJlc3BvbnNlKSB7XG4gICAgaWYgKG1zZy5zdGF0dXMgPT09ICdzdWNjZXNzJykge1xuICAgICAgdGhpcy5fc3RhdGUkLm5leHQoJ3Rlc3RpbmcnKTtcbiAgICAgIHRoaXMuYXR0ZW1wdEtleShtc2cudG9rZW4pO1xuICAgIH1cbiAgfVxuXG4gIGRpc3BhdGNoU3RhcnQobXNnOiBTdGFydFJlc3BvbnNlKSB7XG4gICAgdGhpcy5fbWV0aG9kJC5uZXh0KG1zZy50eXBlcyk7XG4gIH1cblxuICBkaXNwYXRjaEludmFsaWQobXNnKSB7XG4gICAgdGhpcy5fc3RhdGUkLm5leHQoJ2Vycm9yJyk7XG4gICAgY29uc29sZS5sb2coJ0Vycm9yIC0gaW52YWxpZCBhdXRoZW50aWNhdGlvbiBjaGFubmVsIG1lc3NhZ2Ugc2VudCcpO1xuICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gIH1cblxuICBkaXNwYXRjaFRlc3RLZXkobXNnOiBUZXN0UmVzcG9uc2UpIHtcbiAgICBpZiAobXNnLmF1dGggPT09IHRydWUpIHtcbiAgICAgIHRoaXMuc3RvcmUuYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bXG4gICAgICAgICdBdXRob3JpemF0aW9uJ1xuICAgICAgXSA9IGBCZWFyZXIgJHttc2cudG9rZW59YDtcbiAgICAgIHRoaXMuX2tleSQubmV4dChtc2cudG9rZW4pO1xuICAgICAgaWYgKG1zZy55b3UpIHtcbiAgICAgICAgdGhpcy5feW91JC5uZXh0KG1zZy55b3UpO1xuICAgICAgfVxuICAgICAgaWYgKG1zZy5pbmNsdWRlZCkge1xuICAgICAgICBtc2cuaW5jbHVkZWQuZm9yRWFjaCh2YWwgPT4gdGhpcy5zdG9yZS5maXJlUmVhZFVwZGF0ZSh2YWwpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3N0YXRlJC5uZXh0KCdyZWFkeScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnaW52YWxpZCBrZXknKTtcbiAgICAgIHRoaXMuaW5pdGlhdGVMb2dpbigpO1xuICAgIH1cbiAgICAvKiBub29wICovXG4gIH1cblxuICBhdHRlbXB0S2V5KGs6IHN0cmluZykge1xuICAgIHRoaXMuX3N0YXRlJC5uZXh0KCd0ZXN0aW5nJyk7XG4gICAgY29uc3QgcmVxOiBUZXN0S2V5QXV0aGVudGljYXRpb25SZXF1ZXN0ID0ge1xuICAgICAgcmVxdWVzdDogJ3Rlc3RrZXknLFxuICAgICAga2V5OiBrLFxuICAgICAgcmVzcG9uc2VLZXk6IHRoaXMubm9uY2UsXG4gICAgfTtcbiAgICB0aGlzLnN0b3JlLmlvLmVtaXQoJ2F1dGgnLCByZXEpO1xuICB9XG5cbiAgaW5pdGlhdGVMb2dpbigpIHtcbiAgICB0aGlzLl9zdGF0ZSQubmV4dCgnaW52YWxpZCcpO1xuICAgIGNvbnN0IHJlcTogU3RhcnRBdXRoZW50aWNhdGlvblJlcXVlc3QgPSB7XG4gICAgICByZXF1ZXN0OiAnc3RhcnRhdXRoJyxcbiAgICAgIG5vbmNlOiB0aGlzLm5vbmNlLFxuICAgICAgcmVzcG9uc2VLZXk6IHRoaXMubm9uY2UsXG4gICAgfTtcbiAgICB0aGlzLnN0b3JlLmlvLmVtaXQoJ2F1dGgnLCByZXEpO1xuICB9XG59XG4iXX0=
