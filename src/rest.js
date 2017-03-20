import * as axios from 'axios';
import { Storage } from 'plump';

const $axios = Symbol('$axios');
import Promise from 'bluebird';

export class RestStore extends Storage {
  constructor(opts = {}) {
    super(opts);
    const options = Object.assign(
      {},
      {
        baseURL: 'http://localhost/api',
        schemata: [],
      },
      opts
    );
    this[$axios] = options.axios || axios.create(options);
  }

  rest(options) {
    return this[$axios](options);
  }

  write(value) {
    return Promise.resolve()
    .then(() => {
      if (value.id) {
        return this[$axios].patch(`/${value.type}/${value.id}`, value);
      } else if (this.terminal) {
        return this[$axios].post(`/${value.type}`, value);
      } else {
        throw new Error('Cannot create new content in a non-terminal store');
      }
    })
    .then((response) => {
      const result = response.data.data;
      this.fireWriteUpdate({
        type: result.type,
        id: result.id,
        invalidate: ['attributes'],
      });
      return result;
    });
  }

  readAttributes(type, id) {
    return Promise.resolve()
    .then(() => this[$axios].get(`/${type.$name}/${id}`))
    .then((response) => {
      const result = response.data.data;
      if (response.data.included) {
        response.data.included.forEach((item) => {
          this.fireReadUpdate(item);
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

  readRelationship(type, id, relationship) {
    return this[$axios].get(`/${type.$name}/${id}/${relationship}`)
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

  add(typeName, id, relName, childId, extras) {
    const newField = { id: childId, meta: Object.assign({}, extras) };
    return this[$axios].put(`/${typeName}/${id}/${relName}`, newField)
    .then((res) => {
      this.fireWriteUpdate({ type: typeName, id: id, invalidate: [relName] });
      return res.data;
    });
  }

  remove(typeName, id, relName, childId) {
    return this[$axios].delete(`/${typeName}/${id}/${relName}/${childId}`)
    .then((res) => {
      this.fireWriteUpdate({ type: typeName, id: id, invalidate: [relName] });
      return res.data;
    });
  }

  modifyRelationship(typeName, id, relName, childId, extras) {
    return this[$axios].patch(`/${typeName}/${id}/${relName}/${childId}`, extras)
    .then((res) => {
      this.fireWriteUpdate({ type: typeName, id: id, invalidate: [relName] });
      return res.data;
    });
  }

  fireWriteUpdate(opts) {
    return super.fireWriteUpdate(opts);
  }

  delete(typeName, id) {
    return this[$axios].delete(`/${typeName}/${id}`)
    .then((response) => {
      this.fireWriteUpdate({
        type: typeName,
        id: id,
        invalidate: ['attributes'],
      });
      return response.datas;
    });
  }

  query(q) {
    return this[$axios].get(`/${q.type}`, { params: q.query })
    .then((response) => {
      return response.data;
    });
  }
}
