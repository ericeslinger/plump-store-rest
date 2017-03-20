import { MemoryStore } from 'plump';
import axios from 'axios';
import * as Bluebird from 'bluebird';




// function oneOf(getter, list) {
//   return list
//     .filter(item => item && item instanceof Object)
//     .reduce((acc, curr) => {
//       return acc === undefined ? getter(curr) : acc;
//     }, undefined);
// }

export class MockAxios {
  constructor(t) {
    this.mockedAxios = axios.create({ baseURL: '' });
    this.backingStore = new MemoryStore({ terminal: true });
    this.backingStore.addType(t);
    this.myType = t;
    this.mockedAxios.defaults.adapter = (config) => {
      return Bluebird.resolve().then(() => {
        const method = config.method;
        const matchBase = config.url.match(new RegExp(`^/${t.$name}$`));
        const matchItem = config.url.match(new RegExp(`^/${t.$name}/(\\d+)$`));
        const matchSideBase = config.url.match(new RegExp(`^/${t.$name}/(\\d+)/(\\w+)$`));
        const matchSideItem = config.url.match(new RegExp(`^/${t.$name}/(\\d+)/(\\w+)/(\\d+)$`));
        const match = matchSideItem || matchSideBase || matchItem || matchBase || [];

        const request = {
          typeCheck: match.length === 1,
          id: parseInt(match[1], 10),
          relationship: match[2],
          childId: parseInt(match[3], 10),
        };
        const data = config.data ? JSON.parse(config.data) : undefined;

        if (method === 'get') {
          return this.handleGet(request, data);
        } else if (method === 'post') {
          return this.handlePost(request, data);
        } else if (method === 'patch') {
          return this.handlePatch(request, data);
        } else if (method === 'put') {
          return this.handlePut(request, data);
        } else if (method === 'delete') {
          return this.handleDelete(request, data);
        }
        return Bluebird.reject({ response: { status: 400 } });
      }).then(([data, included]) => {
        if (data) {
          const retVal = { data };
          if (included) {
            retVal.included = included;
          }
          return { data: retVal };
        } else {
          return Bluebird.reject({ response: { status: 404 } });
        }
      });
    };
  }

  handleGet(request) {
    const resolves = [];
    if (request.relationship && !request.childId) {
      resolves.push(this.backingStore.read(this.myType.$name, request.id, request.relationship));
    } else if (request.id) {
      resolves.push(
        this.backingStore.read(
          this.myType.$name,
          request.id,
          ['attributes'].concat(Object.keys(this.myType.$schema.relationships))
        )
      );
      resolves.push(
        Bluebird.resolve([
          {
            type: this.myType.$name,
            id: 2,
            attributes: {
              name: 'frotato',
              extended: {},
            },
            relationships: {},
          },
        ])
      );
    } else if (request.typeCheck) {
      resolves.push(this.backingStore.query());
    }
    return Bluebird.all(resolves);
  }

  handlePost(request, data) {
    const resolves = [];
    if (request.typeCheck && !request.id) {
      resolves.push(this.backingStore.write(data));
    }
    return Bluebird.all(resolves);
  }

  handlePatch(request, data) {
    const resolves = [];
    if (request.childId) {
      resolves.push(
        this.backingStore.modifyRelationship(
          this.myType.$name,
          request.id,
          request.relationship,
          request.childId,
          data
        )
      );
    } else if (request.id && !request.relationship) {
      resolves.push(this.backingStore.write(
        Object.assign(
          {},
          data,
          {
            id: request.id,
            type: this.myType.$name,
          }
        )
      ));
    }
    return Bluebird.all(resolves);
  }

  handlePut(request, data) {
    const resolves = [];
    if (request.relationship && !request.childId) {
      resolves.push(
        this.backingStore.add(
          this.myType.$name,
          request.id,
          request.relationship,
          data.id,
          data.meta
        )
      );
    }
    return Bluebird.all(resolves);
  }

  handleDelete(request) {
    const resolves = [];
    if (request.childId) {
      resolves.push(this.backingStore.remove(this.myType.$name, request.id, request.relationship, request.childId));
    } else if (request.id && !request.relationship) {
      resolves.push(this.backingStore.delete(this.myType.$name, request.id));
    }
    return Bluebird.all(resolves);
  }
}
