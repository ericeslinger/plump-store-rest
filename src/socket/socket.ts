import * as SocketIO from 'socket.io-client';
import { AuthenticationRequest, SingletonRequest, Response } from './messageInterfaces';
import * as ulid from 'ulid';

export function rpc<T extends Response> (
  io: SocketIOClient.Socket,
  channel: string,
  request: Partial<AuthenticationRequest>
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.responseKey = ulid();
    io.once(request.responseKey, (response) => {
      resolve(response);
    });
    io.emit(channel, request);
  });
}
