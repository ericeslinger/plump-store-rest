import Axios, { AxiosInstance } from 'axios';
import * as SocketIO from 'socket.io-client';
import { testAuthentication } from './socket/authentication.channel';

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
}

export class RestStore extends Storage implements TerminalStore {
  public axios: AxiosInstance;
  public io: SocketIOClient.Socket;
  private options: RestOptions;
  private _dispatching: Promise<boolean>;
  constructor(opts: RestOptions) {
    super(opts);
    this.options = Object.assign(
      {},
      {
        baseURL: 'http://localhost/api',
      },
      opts,
    );

    this.axios = this.options.axios || Axios.create(this.options);
    if (this.options.socketURL) {
      this.io = SocketIO(this.options.socketURL);
      this.io.on('connect', () => console.log('connected to socket'));
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
        this.fireWriteUpdate({
          type: result.type,
          id: result.id,
          invalidate: ['attributes'],
        });
        return result;
      });
  }

  readAttributes(item: ModelReference): Promise<ModelData> {
    return Promise.resolve()
      .then(() => this.axios.get(`/${item.type}/${item.id}`))
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
    return this.axios
      .get(`/${value.type}/${value.id}/${relName}`)
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
        this.fireWriteUpdate({
          type: value.type,
          id: value.id,
          invalidate: [`relationships.${relName}`],
        });
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
        this.fireWriteUpdate({
          type: value.type,
          id: value.id,
          invalidate: [`relationships.${relName}`],
        });
        return res.data;
      });
  }

  delete(value: ModelReference): Promise<void> {
    return this.axios.delete(`/${value.type}/${value.id}`).then(response => {
      this.fireWriteUpdate({
        type: value.type,
        id: value.id,
        invalidate: ['attributes'],
      });
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
