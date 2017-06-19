import * as SocketIOClient from 'socket.io-client';
import { rpc } from './socket';
import {
  TestResponse,
  StartResponse,
  TokenResponse,
} from './messageInterfaces';
import { Observable, Subject } from 'rxjs';
import * as ulid from 'ulid';

export function testAuthentication(
  io: SocketIOClient.Socket,
  key: string,
): Promise<boolean> {
  return rpc(io, 'auth', {
    request: 'testkey',
    key: key,
  }).then((v: TestResponse) => {
    return v.auth;
  });
}

export function authenticate(
  io: SocketIOClient.Socket,
): Observable<TokenResponse | StartResponse> {
  const nonce = ulid();
  const subj = new Subject<TokenResponse | StartResponse>();
  io.once(nonce, result => {
    if (result.status === 'success') {
      subj.next({
        token: result.token,
        response: 'token',
        result: 'success',
      });
      subj.complete();
    } else {
      subj.error(result);
    }
  });
  rpc(io, 'auth', {
    request: 'startauth',
    nonce: nonce,
  }).then((r: StartResponse) => {
    subj.next(r);
  });
  return subj.asObservable();
}
