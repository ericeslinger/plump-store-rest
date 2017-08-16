import { ModelData } from 'plump';
export interface SingletonRequest {
    responseKey: string;
}
export interface ChannelRequest {
    request: string;
}
export interface ListAuthenticationRequest extends ChannelRequest, SingletonRequest {
    request: 'list';
}
export interface TestKeyAuthenticationRequest extends ChannelRequest, SingletonRequest {
    request: 'testkey';
    key: string;
}
export interface StartAuthenticationRequest extends ChannelRequest, SingletonRequest {
    request: 'startauth';
    nonce: string;
}
export declare type AuthenticationRequest = ListAuthenticationRequest | TestKeyAuthenticationRequest | StartAuthenticationRequest;
export interface Response {
    response: string;
}
export interface InvalidRequestResponse extends Response {
    response: 'invalidRequest';
}
export interface StartResponse extends Response {
    response: 'startauth';
    types: AuthenticationType[];
}
export interface TokenResponse extends Response {
    response: 'token';
    token: string;
    result: 'success' | 'failure';
}
export interface TestResponse extends Response {
    response: 'testkey';
    auth: boolean;
    included?: ModelData[];
}
export declare type AuthenticationResponse = InvalidRequestResponse | StartResponse | TokenResponse | TestResponse;
export interface AuthenticationType {
    url: string;
    iconUrl?: string;
    name: string;
}
