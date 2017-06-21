import { StartResponse, TokenResponse } from './messageInterfaces';
import { Observable } from 'rxjs';
export declare function testAuthentication(io: SocketIOClient.Socket, key: string): Promise<boolean>;
export declare function authenticate(io: SocketIOClient.Socket): Observable<TokenResponse | StartResponse>;
