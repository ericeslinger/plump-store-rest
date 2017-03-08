import * as axios from 'axios';
import { Storage } from 'plump';

const $axios = Symbol('$axios');
const $schemata = Symbol('$schemata');
import Promise from 'bluebird';

export class RestStore extends Storage {
  constructor(opts = {}) {
    super(opts);
    const options = Object.assign(
      {},
      { baseURL: 'http://localhost/api', schemata: [] },
      opts
    );
    this[$axios] = options.axios || axios.create(options);
    this[$schemata] = {};
    for (const schema of options.schemata) {
      this.addSchema(schema);
    }
    // options.schemata.forEach(this.addSchema);
  }

  addSchema(schema) {
    if (this[$schemata][schema.$name]) {
      throw new Error(`Attempting to register duplicate type: ${schema.$name}`);
    } else {
      this[$schemata][schema.$name] = schema;
    }
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
    .then(response => {
      const data = response.data;
      return this.notifyUpdate(t, data.id, data).then(() => data);
    });
  }

  read(t, id) {
    return this[$axios].get(`/${t.$name}/${id}`)
    .then(response => {
      debugger;
      for (const item of response.included) {
        const schema = this[$schemata][item.type];
        const fields = ['attributes'].concat(Object.keys(item.relationships));
        if (!schema) {
          console.warn(`RestStore received unknown type '${item.type}' in HTTP response`);
        }
        this.notifyUpdate(schema, item.id, item, fields);
      }
      return response.data;
    }).catch(err => {
      if (err.response && err.response.status === 404) {
        return null;
      } else {
        throw err;
      }
    });
  }

  // readAttributes(t, id) {
  //   return Promise.resolve()
  //   .then(() => this[$axios].get(`/${t.$name}/${id}`))
  //   .then(response => {
  //     const payload = response.data;
  //     payload.included.forEach(item => {
  //       const schema = item.type;
  //       const updatedFields = Object.keys(item.relationships).concat('attributes');
  //       this.notifyUpdate(schema, item.id, item, updatedFields);
  //     });
  //     return; // TODO!!!!!
  //   }).catch((err) => {
  //     if (err.response && err.response.status === 404) {
  //       return null;
  //     } else {
  //       throw err;
  //     }
  //   });
  // }
  //
  // readRelationship(t, id, relationship) {
  //   return this[$axios].get(`/${t.$name}/${id}/${relationship}`)
  //   .then(response => response.data)
  //   .catch((err) => {
  //     if (err.response && err.response.status === 404) {
  //       return [];
  //     } else {
  //       throw err;
  //     }
  //   });
  // }

  add(type, id, relationshipTitle, childId, extras) {
    const relationshipBlock = type.$fields[relationshipTitle].relationship;
    const sideInfo = relationshipBlock.$sides[relationshipTitle];
    const newField = { [sideInfo.self.field]: id, [sideInfo.other.field]: childId };
    if (relationshipBlock.$extras) {
      for (const extra in relationshipBlock.$extras) {
        if (extra in extras) {
          newField[extra] = extras[extra];
        }
      }
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
    .then(response => {
      return response.data.data;
    });
  }

  query(q) {
    return this[$axios].get(`/${q.type}`, { params: q.query })
    .then(response => {
      return response.data.data;
    });
  }
}
