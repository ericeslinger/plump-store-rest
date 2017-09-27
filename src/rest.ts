import Axios, { AxiosInstance, AxiosPromise } from 'axios';
import * as SocketIO from 'socket.io-client';
// import { testAuthentication } from './socket/authentication.channel';

import {
  Storage,
  StorageOptions,
  IndefiniteModelData,
  ModelData,
  ModelReference,
  TerminalStore,
} from 'plump';

export interface RestOptions extends StorageOptions {
  baseURL?: string;
  axios?: AxiosInstance;
  socketURL?: string;
  apiKey?: string;
  onlyFireSocketEvents?: boolean;
}

export class RestStore extends Storage implements TerminalStore {
  public axios: AxiosInstance;
  public io: SocketIOClient.Socket;
  public options: RestOptions;
  httpInProgress: { [url: string]: AxiosPromise } = {};
  constructor(opts: RestOptions) {
    super(opts);
    this.options = Object.assign(
      {},
      {
        baseURL: 'http://localhost/api',
        onlyFireSocketEvents: false,
      },
      opts,
    );

    this.axios = this.options.axios || Axios.create(this.options);
    if (this.options.socketURL) {
      this.io = SocketIO(this.options.socketURL, { transports: ['websocket'] });
      this.io.on('connect', () => console.log('connected to socket'));
      this.io.on('plumpUpdate', data => this.updateFromSocket(data));
    }
  }

  debounceGet(url: string): AxiosPromise {
    if (!this.httpInProgress[url]) {
      this.httpInProgress[url] = this.axios.get(url).then(v => {
        delete this.httpInProgress[url];
        return v;
      });
    }
    return this.httpInProgress[url];
  }

  updateFromSocket(data) {
    try {
      if (data.eventType === 'update') {
        this.fireWriteUpdate({
          type: data.type,
          id: data.id,
          invalidate: ['attributes'],
        });
      } else if (data.eventType === 'relationshipCreate') {
        this.fireWriteUpdate({
          type: data.type,
          id: data.id,
          invalidate: [data.field],
        });
      } else if (data.eventType === 'relationshipUpdate') {
        this.fireWriteUpdate({
          type: data.type,
          id: data.id,
          invalidate: [data.field],
        });
      } else if (data.eventType === 'relationshipDelete') {
        this.fireWriteUpdate({
          type: data.type,
          id: data.id,
          invalidate: [data.field],
        });
      }
    } catch (e) {
      console.log('ERROR');
      console.log(e);
    }
  }

  writeAttributes(value: IndefiniteModelData): Promise<ModelData> {
    return Promise.resolve()
      .then(() => {
        if (value.id) {
          return this.axios.patch(`/${value.type}/${value.id}`, value);
        } else if (this.terminal) {
          return this.axios.post(`/${value.type}`, value);
        } else {
          throw new Error('Cannot create new content in a non-terminal store');
        }
      })
      .then(response => {
        const result = response.data;
        if (!this.options.onlyFireSocketEvents) {
          this.fireWriteUpdate({
            type: result.type,
            id: result.id,
            invalidate: ['attributes'],
          });
        }
        return result;
      });
  }

  readAttributes(item: ModelReference): Promise<ModelData> {
    return Promise.resolve()
      .then(() => this.debounceGet(`/${item.type}/${item.id}`))
      .then(reply => {
        if (reply.status === 404) {
          return null;
        } else if (reply.status !== 200) {
          throw new Error(reply.statusText);
        } else {
          const result = reply.data;
          if (result.included) {
            result.included.forEach(includedData => {
              this.fireReadUpdate(includedData);
            });
          }
          return result;
        }
      })
      .catch(err => {
        if (err.response && err.response.status === 404) {
          return null;
        } else {
          throw err;
        }
      });
  }

  readRelationship(value: ModelReference, relName: string): Promise<ModelData> {
    return this.debounceGet(`/${value.type}/${value.id}/${relName}`)
      .then(response => {
        if (response.data.included) {
          response.data.included.forEach(item => {
            this.fireReadUpdate(item);
          });
        }
        return response.data;
      })
      .catch(err => {
        if (err.response && err.response.status === 404) {
          return [];
        } else {
          throw err;
        }
      });
  }

  writeRelationshipItem(
    value: ModelReference,
    relName: string,
    child: { id: string | number },
  ): Promise<ModelData> {
    return this.axios
      .put(`/${value.type}/${value.id}/${relName}`, child)
      .then(res => {
        if (!this.options.onlyFireSocketEvents) {
          this.fireWriteUpdate({
            type: value.type,
            id: value.id,
            invalidate: [`relationships.${relName}`],
          });
        }
        return res.data;
      });
  }

  deleteRelationshipItem(
    value: ModelReference,
    relName: string,
    child: { id: string | number },
  ): Promise<ModelData> {
    return this.axios
      .delete(`/${value.type}/${value.id}/${relName}/${child.id}`)
      .then(res => {
        if (!this.options.onlyFireSocketEvents) {
          this.fireWriteUpdate({
            type: value.type,
            id: value.id,
            invalidate: [`relationships.${relName}`],
          });
        }
        return res.data;
      });
  }

  delete(value: ModelReference): Promise<void> {
    return this.axios.delete(`/${value.type}/${value.id}`).then(response => {
      if (!this.options.onlyFireSocketEvents) {
        this.fireWriteUpdate({
          type: value.type,
          id: value.id,
          invalidate: ['attributes'],
        });
      }
      return response.data;
    });
  }

  query(type: string, q: any) {
    return this.axios.get(`/${type}`, { params: q }).then(response => {
      if (response.data.included) {
        response.data.included.forEach(item => {
          this.fireReadUpdate(item);
        });
      }
      return response.data.data;
    });
  }
}
