export interface ChannelMessage {
  request: string;
}

export interface ListAuthenticationChannelMessage extends ChannelMessage {
  request: 'list';
}

export interface TestKeyAuthenticationChannelMessage extends ChannelMessage {
  request: 'testkey';
  key: string;
}

export interface StartAuthenticationChannelMessage extends ChannelMessage {
  request: 'startauth';
  nonce: string;
}

export type AuthenticationChannelMessage
  = ListAuthenticationChannelMessage
  | TestKeyAuthenticationChannelMessage
  | StartAuthenticationChannelMessage;

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

export type AuthenticationChannelResponse
  = InvalidRequestResponse
  | ListResponse
  | TestResponse;
