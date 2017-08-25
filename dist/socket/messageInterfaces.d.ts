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
export interface GoodTestResponse extends Response {
    response: 'testkey';
    auth: true;
    token: string;
    you?: any;
    included?: ModelData[];
}
export interface BadTestResponse extends Response {
    response: 'testkey';
    auth: false;
}
export declare type TestResponse = GoodTestResponse | BadTestResponse;
export interface GoodTokenResponse extends Response {
    response: 'token';
    status: 'success';
    token: string;
}
export interface BadTokenResponse extends Response {
    response: 'token';
    status: 'failure';
}
export declare type TokenResponse = GoodTokenResponse | BadTokenResponse;
export declare type AuthenticationResponse = InvalidRequestResponse | StartResponse | TokenResponse | TestResponse;
export interface AuthenticationType {
    url: string;
    iconUrl?: string;
    name: string;
}
