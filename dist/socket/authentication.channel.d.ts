import { StartResponse, TokenResponse } from './messageInterfaces';
import { RestStore } from '../rest';
import { Observable } from 'rxjs';
export declare function testAuthentication(store: RestStore, key: string): Promise<boolean>;
export declare function authenticate(store: RestStore): Observable<TokenResponse | StartResponse>;
