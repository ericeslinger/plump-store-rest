/// <reference types="socket.io-client" />
import { AuthenticationRequest, Response } from './messageInterfaces';
export declare function rpc<T extends Response>(io: SocketIOClient.Socket, channel: string, request: Partial<AuthenticationRequest>): Promise<T>;
