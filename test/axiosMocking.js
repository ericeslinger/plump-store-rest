import { MemoryStore } from 'plump';
import axios from 'axios';
import Bluebird from 'bluebird';


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
        } else if (method === 'patch' && request.childId) {
          return this.handlePatchRelationship(request, data);
        } else if (method === 'patch' && !request.childId) {
          return this.handlePatchAttributes(request, data);
        } else if (method === 'put') {
          return this.handlePut(request, data);
        } else if (method === 'delete') {
          return this.handleDelete(request, data);
        }
        return Bluebird.reject({ response: { status: 400 } });
      }).then((data) => {
        if (data) {
          const retVal = { data };
          if (config.method === 'get') {
            retVal.included = [{
              type: this.myType.$name,
              id: 2,
              attributes: {
                name: 'frotato',
                extended: {},
              },
              relationships: {},
            }];
          }
          return { data: retVal };
        } else {
          return Bluebird.reject({ response: { status: 404 } });
        }
      });
    };
  }

  handleGet(request) {
    if (request.relationship) {
      return this.backingStore.read(this.myType.$name, request.id, request.relationship);
    } else {
      return this.backingStore.read(
        this.myType.$name,
        request.id,
        ['attributes'].concat(Object.keys(this.myType.$schema.relationships))
      );
    }
  }

  handlePost(request, data) {
    return this.backingStore.write(data);
  }

  handlePatchAttributes(request, data) {
    return this.backingStore.write(
      Object.assign({}, data, { id: request.id, type: this.myType.$name })
    );
  }

  handlePatchRelationship(request, data) {
    return this.backingStore.modifyRelationship(this.myType, request.id, request.relationship, request.childId, data);
  }

  handlePut(request, data) {
    return this.backingStore.add(this.myType.$name, request.id, request.relationship, data.id, data.meta);
  }

  handleDelete(request) {
    if (!request.relationship) {
      return this.backingStore.delete(this.myType.$name, request.id);
    } else {
      return this.backingStore.remove(this.myType.$name, request.id, request.relationship, request.childId);
    }
  }
}
