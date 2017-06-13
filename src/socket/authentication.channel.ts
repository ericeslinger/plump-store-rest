import * as SocketIO from 'socket.io-client';
import { rpc } from './socket';
import { TestResponse } from './messageInterfaces';

export function testAuthentication(io: SocketIOClient.Socket, key: string): Promise<boolean> {
  return rpc(io, 'authentication', { request: 'testkey', key: key })
  .then((v: TestResponse) => {
    return v.auth;
  });
}
