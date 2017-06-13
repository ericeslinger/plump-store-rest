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

export type AuthenticationRequest
  = ListAuthenticationRequest
  | TestKeyAuthenticationRequest
  | StartAuthenticationRequest;

export interface Response {
  response: string;
}

export interface InvalidRequestResponse extends Response {
  response: 'invalidRequest';
}

export interface ListResponse extends Response {
  response: 'list';
  types: string[];
}

export interface TestResponse extends Response {
  response: 'testkey';
  auth: boolean;
}

export type AuthenticationResponse
  = InvalidRequestResponse
  | ListResponse
  | TestResponse;
