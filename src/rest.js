import * as axios from 'axios';
import * as Bluebird from 'bluebird';
import mergeOptions from 'merge-options';
import { Storage } from 'plump';

const $axios = Symbol('$axios');

export class RestStore extends Storage {
  constructor(opts = {}) {
    super(opts);
    const options = Object.assign(
      {},
      { baseURL: 'http://localhost/api', schemata: [] },
      opts
    );
    this[$axios] = options.axios || axios.create(options);
  }

  rest(options) {
    return this[$axios](options);
  }

  write(v) {
    return Bluebird.resolve()
    .then(() => {
      if (Object.keys(v).length > 0) {
        return this.writeAttributes(v);
      } else {
        return v;
      }
    })
    .then(attrResponse => {
      const updatedValues = mergeOptions(v, attrResponse);
      if (v.relationships) {
        const relNames = Object.keys(v.relationships);
        return Bluebird.all(
          relNames.map(relName => this.writeRelationship(v, relName))
        ).then(responses => {
          return responses.reduce((acc, curr, idx) => {
            return mergeOptions(acc, { relationships: { [relNames[idx]]: [curr] } });
          }, updated);
        });
      } else {
        return updated;
      }
    // TODO: cache written data
    // }).then(data => {
    //   return this.notifyUpdate(t, data.id, data).then(() => data);
    }).catch(err => {
      throw err;
    });
  }

  writeAttributes(value) {
    if (value.id) {
      return this[$axios].patch(`/${value.type}/${value.id}`, value).then(v => v.data);
    } else if (this.terminal) {
      return this[$axios].post(`/${value.type}`, value).then(v => v.data);
    } else {
      throw new Error('Cannot create new content in a non-terminal store');
    }
  }

  // TODO: Reduce the relationship deltas into
  // a list of things that can be resolved in parallel, then Bluebird.all them
  writeRelationship(value, relationship) {
    const selfRoute = `/${value.type}/${value.id}`;
    return value.relationships[relationship]
      .reduce((thenable, curr) => {
        return thenable.then(() => {
          if (curr.op === 'add') {
            debugger;
            return this.add(value.type, value.id, relationship, curr.data.id, curr.data.meta);
            // return this[$axios].put(`${selfRoute}/${relationship}`, curr.data).then(v => v.data);
          } else if (curr.op === 'modify') {
            // TODO: maybe redesign relationship deltas to make id top-level and 'data' into 'meta'
            return this[$axios].patch(`${selfRoute}/${relationship}/${curr.data.id}`, curr).then(v => v.data);
          } else if (curr.op === 'remove') {
            return this[$axios].delete(`${selfRoute}/${relationship}/${curr.data.id}`).then(v => v.data);
          } else {
            console.log(JSON.stringify(value, null, 2));
            throw new Error(`Unknown relationship delta op: ${curr.op}`);
          }
        });
      }, Bluebird.resolve());
  }

  read(t, id, opts) {
    const keys = opts && !Array.isArray(opts) ? [opts] : opts;
    return this[$axios].get(`/${t}/${id}`)
    .then(response => {
      const result = response.data;
      // for (const item of result.included) {
        // TODO: cache included data
        // console.log('INCLUDED:', item.type, item.id);
      // }
      const item = result.data;
      const retVal = { type: item.type, id: item.id, attributes: item.attributes };
      if (keys) {
        retVal.relationships = {};
        for (const key of keys) {
          if (key in item.relationships) {
            retVal.relationships[key] = item.relationships[key];
          }
        }
      } else {
        retVal.relationships = item.relationships;
      }
      return retVal;
    }).catch(err => {
      if (err.response && err.response.status === 404) {
        return null;
      } else {
        throw err;
      }
    });
  }

  add(t, id, relationshipTitle, childId, extras) {
    const type = this.getType(t);
    const relationshipBlock = type.$schema.relationships[relationshipTitle].type;
    const newField = { id: childId };
    if (relationshipBlock.$extras) {
      for (const extra in extras) {
        if (extra in relationshipBlock.$extras) {
          newField.meta = newField.meta || {};
          newField.meta[extra] = extras[extra];
        }
      }
    }
    return this[$axios].put(`/${t}/${id}/${relationshipTitle}`, newField)
    .then(() => this.notifyUpdate(type, id, null, relationshipTitle));
  }

  remove(t, id, relationshipTitle, childId) {
    return this[$axios].delete(`/${t}/${id}/${relationshipTitle}/${childId}`)
    .then(() => this.notifyUpdate(t, id, null, relationshipTitle));
  }

  modifyRelationship(t, id, relationshipTitle, childId, extras) {
    return this[$axios].patch(`/${t}/${id}/${relationshipTitle}/${childId}`, extras)
    .then(() => this.notifyUpdate(t, id, null, relationshipTitle));
  }

  delete(t, id) {
    return this[$axios].delete(`/${t}/${id}`)
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
