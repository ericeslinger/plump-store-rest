import * as axios from 'axios';
import { Storage, $self } from 'plump';
import { JSONApi } from 'plump-json-api';

const $axios = Symbol('$axios');
const $json = Symbol('$json');
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
    this[$json] = new JSONApi({ schemata: options.schemata, baseURL: options.baseURL });
  }

  rest(options) {
    return this[$axios](options);
  }

  write(t, v) {
    return Promise.resolve()
    .then(() => {
      if (v[t.$id]) {
        return this[$axios].patch(`/${t.$name}/${v[t.$id]}`, v);
      } else if (this.terminal) {
        return this[$axios].post(`/${t.$name}`, v);
      } else {
        throw new Error('Cannot create new content in a non-terminal store');
      }
    })
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
    })
    .then((result) => this.notifyUpdate(t, result[t.$id], result).then(() => result));
  }

  readOne(t, id) {
    return Promise.resolve()
    .then(() => this[$axios].get(`/${t.$name}/${id}`))
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

  readMany(t, id, relationship) {
    return this[$axios].get(`/${t.$name}/${id}/${relationship}`)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response && err.response.status === 404) {
        return [];
      } else {
        throw err;
      }
    });
  }

  add(type, id, relationshipTitle, childId, extras) {
    const relationshipBlock = type.$fields[relationshipTitle];
    const sideInfo = relationshipBlock.relationship.$sides[relationshipTitle];
    const newField = { [sideInfo.self.field]: id, [sideInfo.other.field]: childId };
    if (relationshipBlock.relationship.$extras) {
      Object.keys(relationshipBlock.relationship.$extras).forEach((extra) => {
        newField[extra] = extras[extra];
      });
    }
    return this[$axios].put(`/${type.$name}/${id}/${relationshipTitle}`, newField)
    .then(() => this.notifyUpdate(type, id, null, relationshipTitle));
  }

  remove(t, id, relationshipTitle, childId) {
    return this[$axios].delete(`/${t.$name}/${id}/${relationshipTitle}/${childId}`)
    .then(() => this.notifyUpdate(t, id, null, relationshipTitle));
  }

  modifyRelationship(t, id, relationshipTitle, childId, extras) {
    return this[$axios].patch(`/${t.$name}/${id}/${relationshipTitle}/${childId}`, extras)
    .then(() => this.notifyUpdate(t, id, null, relationshipTitle));
  }

  delete(t, id) {
    return this[$axios].delete(`/${t.$name}/${id}`)
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
