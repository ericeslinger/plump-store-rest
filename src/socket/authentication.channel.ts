// import * as SocketIOClient from 'socket.io-client';
// import { rpc } from './socket';
// import {
//   TestResponse,
//   StartResponse,
//   TokenResponse,
// } from './messageInterfaces';
// import { RestStore } from '../rest';
// import { Observable, Subject } from 'rxjs';
// import * as ulid from 'ulid';
//
// export function testAuthentication(
//   store: RestStore,
//   key: string,
// ): Promise<boolean> {
//   return rpc(store.io, 'auth', {
//     request: 'testkey',
//     key: key,
//   }).then((v: TestResponse) => {
//     if (v.auth && v.included) {
//       v.included.forEach(val => store.fireReadUpdate(val));
//     }
//     return v.auth;
//   });
// }
//
// export function authenticate(
//   store: RestStore,
// ): Observable<TokenResponse | StartResponse> {
//   const nonce = ulid();
//   const subj = new Subject<TokenResponse | StartResponse>();
//   store.io.once(nonce, result => {
//     if (result.status === 'success') {
//       if (result.included) {
//         result.included.forEach(val => store.fireReadUpdate(val));
//       }
//       subj.next({
//         token: result.token,
//         response: 'token',
//         result: 'success',
//       });
//       subj.complete();
//     } else {
//       subj.error(result);
//     }
//   });
//   rpc(store.io, 'auth', {
//     request: 'startauth',
//     nonce: nonce,
//   }).then((r: StartResponse) => {
//     subj.next(r);
//   });
//   return subj.asObservable();
// }
