import * as SocketIO from 'socket.io-client';
import { rpc } from './socket';
import { TestResponse } from './messageInterfaces';
import * as ulid from 'ulid';

export function testAuthentication(
  io: SocketIOClient.Socket,
  key: string,
): Promise<boolean> {
  return rpc(io, 'authentication', {
    request: 'testkey',
    key: key,
  }).then((v: TestResponse) => {
    return v.auth;
  });
}

export function authenticate(io: SocketIOClient.Socket): Promise<string> {
  const nonce = ulid();
  return new Promise((resolve, reject) => {
    io.once(nonce, result => {
      if (result.status === 'success') {
        resolve(result.token);
      } else {
        reject(result);
      }
    });
    io.emit('auth', { request: 'startauth', nonce: nonce });
  });
}
