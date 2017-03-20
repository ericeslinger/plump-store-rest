import * as axios from 'axios';
import { Storage, $self } from 'plump';
import { JSONApi } from 'plump-json-api';

const $axios = Symbol('$axios');
const $json = Symbol('$json');
import Bluebird from 'bluebird';

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
    this[$json] = new JSONApi({ schemata: options.schemata, baseURL: options.baseURL });
  }

  rest(options) {
    return this[$axios](options);
  }

  write(typeName, v) {
    const type = this.getType(typeName);
    return Bluebird.resolve()
    .then(() => {
      if (v.id) {
        return this[$axios].patch(`/${type.$name}/${v.id}`, v);
      } else if (this.terminal) {
        return this[$axios].post(`/${type.$name}`, v);
      } else {
        throw new Error('Cannot create new content in a non-terminal store');
      }
    })
    .then((response) => {
      const result = this[$json].parse(response.data).data;
      return result;
      // return Bluebird.all(Object.keys(type.relationships).map((relName) => {
      //   if (v.relationships && v.relationships[relName]) {
      //     return Bluebird.all(v.relationships[relName].map((delta) => {
      //       if (delta.op === 'add') {
      //         return this.add(typeName, result.id, relName, delta.id, delta.meta)
      //       }
      //     }))
      //   }
      // }))
      // result.extended.forEach((item, index) => {
        // const schema = this[$json].schema(item.type);
        // const childRelationships = response.data.included[index].relationships;
        // this.notifyUpdate(schema, item.id, item, Object.keys(childRelationships).concat($self));
      // });
    })
    .then((result) => this.notifyUpdate(typeName, result.id, result).then(() => result));
  }

  readOne(typeName, id) {
    return Bluebird.resolve()
    .then(() => this[$axios].get(`/${typeName}/${id}`))
    .then((response) => {
      const result = this[$json].parse(response.data);
      result.extended.forEach((item, index) => {
        const schema = this[$json].schema(item.type);
        const childRelationships = response.data.included[index].relationships;
        this.notifyUpdate(schema, item.id, item, Object.keys(childRelationships).concat($self));
      });
      const root = {};
      for (const field in result.root) {
        if (field !== 'type') {
          root[field] = result.root[field];
        }
      }
      return root;
    }).catch((err) => {
      if (err.response && err.response.status === 404) {
        return null;
      } else {
        throw err;
      }
    });
  }

  readMany(typeName, id, relationship) {
    return this[$axios].get(`/${typeName}/${id}/${relationship}`)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response && err.response.status === 404) {
        return [];
      } else {
        throw err;
      }
    });
  }

  add(typeName, id, relationshipTitle, childId, extras) {
    const newField = { id: childId, meta: Object.assign({}, extras) };
    return this[$axios].put(`/${typeName}/${id}/${relationshipTitle}`, newField)
    .then(() => this.notifyUpdate(typeName, id, null, relationshipTitle));
  }

  remove(typeName, id, relationshipTitle, childId) {
    return this[$axios].delete(`/${typeName}/${id}/${relationshipTitle}/${childId}`)
    .then(() => this.notifyUpdate(typeName, id, null, relationshipTitle));
  }

  modifyRelationship(typeName, id, relationshipTitle, childId, extras) {
    return this[$axios].patch(`/${typeName}/${id}/${relationshipTitle}/${childId}`, extras)
    .then(() => this.notifyUpdate(typeName, id, null, relationshipTitle));
  }

  delete(typeName, id) {
    return this[$axios].delete(`/${typeName}/${id}`)
    .then((response) => {
      return response.data;
    });
  }

  query(q) {
    return this[$axios].get(`/${q.type}`, { params: q.query })
    .then((response) => {
      return response.data;
    });
  }
}
