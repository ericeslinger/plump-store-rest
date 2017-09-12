import * as ulid from 'ulid';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { RestStore } from '../rest';
import { rpc } from './socket';
import {
  TestKeyAuthenticationRequest,
  StartAuthenticationRequest,
  StartResponse,
  TokenResponse,
  TestResponse,
  AuthenticationResponse,
  AuthenticationType,
} from './messageInterfaces';

export type AuthenticatorStates =
  | 'ready'
  | 'untested'
  | 'error'
  | 'testing'
  | 'invalid';

export class Authenticator {
  public nonce: string;

  public key$: Observable<string>;
  public state$: Observable<AuthenticatorStates>;
  public method$: Observable<AuthenticationType[]>;
  public you$: Observable<any>;

  private _key$: Subject<string> = new BehaviorSubject<string>(null);
  private _state$: Subject<AuthenticatorStates> = new BehaviorSubject<
    AuthenticatorStates
  >('untested');
  private _method$: Subject<AuthenticationType[]> = new Subject<
    AuthenticationType[]
  >();
  private _you$: Subject<any> = new Subject<any>();

  constructor(public store: RestStore) {
    this.state$ = this._state$.asObservable();
    this.key$ = this._key$.asObservable();
    this.method$ = this._method$.asObservable();
    this.you$ = this._you$.asObservable();
    this.nonce = ulid();
    this.store.io.on(this.nonce, (msg: AuthenticationResponse) => {
      console.log(msg);
      switch (msg.response) {
        case 'token':
          return this.dispatchToken(msg);
        case 'startauth':
          return this.dispatchStart(msg);
        case 'invalidRequest':
          return this.dispatchInvalid(msg);
        case 'testkey':
          return this.dispatchTestKey(msg);
      }
    });
  }

  dispatchToken(msg: TokenResponse) {
    if (msg.status === 'success') {
      this._state$.next('testing');
      this.attemptKey(msg.token);
    }
  }

  dispatchStart(msg: StartResponse) {
    this._method$.next(msg.types);
  }

  dispatchInvalid(msg) {
    this._state$.next('error');
    console.log('Error - invalid authentication channel message sent');
    console.log(msg);
  }

  dispatchTestKey(msg: TestResponse) {
    if (msg.auth === true) {
      this.store.axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${msg.token}`;
      this._key$.next(msg.token);
      if (msg.you) {
        this._you$.next(msg.you);
      }
      if (msg.included) {
        msg.included.forEach(val => this.store.fireReadUpdate(val));
      }
      this._state$.next('ready');
    } else {
      console.log('invalid key');
      this.initiateLogin();
    }
    /* noop */
  }

  attemptKey(k: string) {
    this._state$.next('testing');
    const req: TestKeyAuthenticationRequest = {
      request: 'testkey',
      key: k,
      responseKey: this.nonce,
    };
    this.store.io.emit('auth', req);
  }

  initiateLogin() {
    this._state$.next('invalid');
    const req: StartAuthenticationRequest = {
      request: 'startauth',
      nonce: this.nonce,
      responseKey: this.nonce,
    };
    this.store.io.emit('auth', req);
  }
}
