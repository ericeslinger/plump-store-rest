import * as SocketIO from 'socket.io-client';
import { ChannelRequest, SingletonRequest, Response } from './messageInterfaces';
import * as ulid from 'ulid';

export function rpc<T extends Response, U extends ChannelRequest> (
  io: SocketIOClient.Socket,
  channel: string,
  request: U
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const req: ChannelRequest & SingletonRequest = Object.assign(
      {},
      request,
      {
        responseKey: ulid(),
      }
    );
    io.once(req.responseKey, (response) => {
      resolve(response);
    });
    io.emit(channel, req);
  });
}
