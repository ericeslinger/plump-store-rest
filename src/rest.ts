import Axios, { AxiosInstance } from 'axios';
import { Storage, StorageOptions, IndefiniteModelData, ModelData, ModelReference, TerminalStore } from 'plump';

export class RestStore extends Storage implements TerminalStore {
  private axios;
  constructor(opts: StorageOptions & { baseUrl?: string, axios?: AxiosInstance }) {
    super(opts);
    const options = Object.assign(
      {},
      {
        baseURL: 'http://localhost/api',
      },
      opts
    );

    this.axios = options.axios || Axios.create(options);
  }

  writeAttributes(value: IndefiniteModelData): Promise<ModelData> {
    return Promise.resolve()
    .then(() => {
      if (value.id) {
        return this.axios.patch(`/${value.typeName}/${value.id}`, value);
      } else if (this.terminal) {
        return this.axios.post(`/${value.typeName}`, value);
      } else {
        throw new Error('Cannot create new content in a non-terminal store');
      }
    })
    .then((response) => {
      const result = response.data.data;
      this.fireWriteUpdate({
        typeName: result.type,
        id: result.id,
        invalidate: ['attributes'],
      });
      return result;
    });
  }

  readAttributes(item: ModelReference): Promise<ModelData> {
    return Promise.resolve()
    .then(() => this.axios.get(`/${item.typeName}/${item.id}`))
    .then((response) => {
      const result = response.data.data;
      if (response.data.included) {
        response.data.included.forEach((includedData) => {
          this.fireReadUpdate(includedData);
        });
      }
      return result;
    }).catch((err) => {
      if (err.response && err.response.status === 404) {
        return null;
      } else {
        throw err;
      }
    });
  }

  readRelationship(value: ModelReference, relName: string): Promise<ModelData> {
    return this.axios.get(`/${value.typeName}/${value.id}/${relName}`)
    .then((response) => {
      if (response.data.included) {
        response.data.included.forEach((item) => {
          this.fireReadUpdate(item);
        });
      }
      return response.data.data;
    })
    .catch((err) => {
      if (err.response && err.response.status === 404) {
        return [];
      } else {
        throw err;
      }
    });
  }

  writeRelationshipItem( value: ModelReference, relName: string, child: {id: string | number} ): Promise<ModelData> {
    return this.axios.put(`/${value.typeName}/${value.id}/${relName}`, child)
    .then((res) => {
      this.fireWriteUpdate({ typeName: value.typeName, id: value.id, invalidate: [`relationships.${relName}`] });
      return res.data;
    });
  }

  deleteRelationshipItem( value: ModelReference, relName: string, child: {id: string | number} ): Promise<ModelData> {
    return this.axios.delete(`/${value.typeName}/${value.id}/${relName}/${child.id}`)
    .then((res) => {
      this.fireWriteUpdate({ typeName: value.typeName, id: value.id, invalidate: [`relationships.${relName}`] });
      return res.data;
    });
  }

  delete(value: ModelReference): Promise<void> {
    return this.axios.delete(`/${value.typeName}/${value.id}`)
    .then((response) => {
      this.fireWriteUpdate({
        typeName: value.typeName,
        id: value.id,
        invalidate: ['attributes'],
      });
      return response.datas;
    });
  }

  query(q) {
    return this.axios.get(`/${q.type}`, { params: q.query })
    .then((response) => {
      return response.data;
    });
  }
}
