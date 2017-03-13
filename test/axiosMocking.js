import { MemoryStore } from 'plump';
import * as axios from 'axios';
import * as Bluebird from 'bluebird';

const backingStore = new MemoryStore({ terminal: true });

function handleGet(t, request) {
  const resolves = [];
  if (request.relationship && !request.childId) {
    resolves.push(backingStore.read(t, request.id, request.relationship));
  } else if (request.id) {
    resolves.push(
      backingStore.read(
        t,
        request.id,
        ['attributes'].concat(Object.keys(t.$schema.relationships))
      )
    );
    resolves.push(
      Bluebird.resolve([
        {
          type: t.$name,
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
    resolves.push(backingStore.query());
  }
  return Bluebird.all(resolves);
}

function handlePost(t, request, data) {
  const resolves = [];
  if (request.typeCheck && !request.id) {
    resolves.push(backingStore.write(t, data));
  }
  return Bluebird.all(resolves);
}

function handlePatch(t, request, data) {
  const resolves = [];
  if (request.childId) {
    resolves.push(
      backingStore.modifyRelationship(
        t,
        request.id,
        request.relationship,
        request.childId,
        data
      )
    );
  } else if (request.id && !request.relationship) {
    resolves.push(backingStore.write(
      t,
      Object.assign(
        {},
        data,
        { id: request.id }
      )
    ));
  }
  return Bluebird.all(resolves);
}

function handlePut(t, request, data) {
  const resolves = [];
  if (request.relationship && !request.childId) {
    resolves.push(
      backingStore.add(
        t,
        request.id,
        request.relationship,
        data.id,
        data.meta
      )
    );
  }
  return Bluebird.all(resolves);
}

function handleDelete(t, request) {
  const resolves = [];
  if (request.childId) {
    resolves.push(backingStore.remove(t, request.id, request.relationship, request.childId));
  } else if (request.id && !request.relationship) {
    resolves.push(backingStore.delete(t, request.id));
  }
  return Bluebird.all(resolves);
}

// function oneOf(getter, list) {
//   return list
//     .filter(item => item && item instanceof Object)
//     .reduce((acc, curr) => {
//       return acc === undefined ? getter(curr) : acc;
//     }, undefined);
// }

function mockup(t) {
  const mockedAxios = axios.create({ baseURL: '' });
  mockedAxios.defaults.adapter = (config) => {
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
        return handleGet(t, request, data);
      } else if (method === 'post') {
        return handlePost(t, request, data);
      } else if (method === 'patch') {
        return handlePatch(t, request, data);
      } else if (method === 'put') {
        return handlePut(t, request, data);
      } else if (method === 'delete') {
        return handleDelete(t, request, data);
      }
      return Bluebird.reject({ response: { status: 400 } });
    }).then(([data, included]) => {
      if (data) {
        const retVal = { data };
        if (included) {
          retVal.included = included;
        }
        return retVal;
      } else {
        return Bluebird.reject({ response: { status: 404 } });
      }
    });
  };
  return mockedAxios;
}

const axiosMock = {
  mockup,
};

export default axiosMock;
