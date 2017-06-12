import * as SocketIO from 'socket.io-client';
import { ChannelMessage, Response } from './messageInterfaces';

export function rpc<T extends Response, U extends ChannelMessage>(io: SocketIOClient.Socket, channel: string, request: U): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const handleError = (err) => reject(err);
    io.once(channel, (response) => {
      io.off('error', handleError);
      resolve(response);
    });
    io.once('error', handleError);
    io.emit(channel, request);
  })
}
