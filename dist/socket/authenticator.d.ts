import { Subject, Observable } from 'rxjs';
import { RestStore } from '../rest';
import { StartResponse, TokenResponse, TestResponse, AuthenticationType } from './messageInterfaces';
export declare type AuthenticatorStates = 'ready' | 'untested' | 'error' | 'testing' | 'invalid';
export declare class Authenticator {
    store: RestStore;
    nonce: string;
    key$: Observable<string>;
    state$: Observable<AuthenticatorStates>;
    method$: Observable<AuthenticationType[]>;
    you$: Observable<any>;
    _key$: Subject<string>;
    _state$: Subject<AuthenticatorStates>;
    _method$: Subject<AuthenticationType[]>;
    _you$: Subject<any>;
    constructor(store: RestStore);
    dispatchToken(msg: TokenResponse): void;
    dispatchStart(msg: StartResponse): void;
    dispatchInvalid(msg: any): void;
    dispatchTestKey(msg: TestResponse): void;
    attemptKey(k: string): void;
    initiateLogin(): void;
}
