import { MemoryStore, PackagedModelData } from 'plump';
import Axios, { AxiosResponse } from 'axios';
import { TestType } from './testType';


const backingStore = new MemoryStore({ terminal: true });
export function init() {
  return backingStore.addSchema(TestType);
}

function axiosAdapter(config): Promise<AxiosResponse> {
  return Promise.resolve().then(() => {
    const method = config.method;
    const matchBase = config.url.match(new RegExp(`^/${TestType.typeName}$`));
    const matchItem = config.url.match(new RegExp(`^/${TestType.typeName}/(\\d+)$`));
    const matchSideBase = config.url.match(new RegExp(`^/${TestType.typeName}/(\\d+)/(\\w+)$`));
    const matchSideItem = config.url.match(new RegExp(`^/${TestType.typeName}/(\\d+)/(\\w+)/(\\d+)$`));
    const match = matchSideItem || matchSideBase || matchItem || matchBase || [];

    const request = {
      typeCheck: match.length === 1,
      id: parseInt(match[1], 10),
      relationship: match[2],
      childId: parseInt(match[3], 10),
    };
    const data = config.data ? JSON.parse(config.data) : undefined;

    if (method === 'get') {
      return handleGet(request);
    } else if (method === 'post') {
      return handlePost(request, data);
    } else if (method === 'patch' && request.childId) {
      return handlePatchRelationship(request, data);
    } else if (method === 'patch' && !request.childId) {
      return handlePatchAttributes(request, data);
    } else if (method === 'put') {
      return handlePut(request, data);
    } else if (method === 'delete') {
      return handleDelete(request);
    }
    return Promise.reject({ response: { status: 400 } });
  }).then((data: PackagedModelData) => {
    if (data) {
      const retVal: AxiosResponse = {
         data: data,
         status: 200,
         statusText: 'OK',
         headers: '',
         config: config,
      };
      return retVal;
    } else {
      return Promise.reject({ response: { status: 404 } });
    }
  });
}

function handleGet(request): Promise<PackagedModelData> {
  return Promise.resolve()
  .then(() => {
    if (request.relationship) {
      return backingStore.readRelationship({ typeName: TestType.typeName, id: request.id }, request.relationship);
    } else {
      return backingStore.read( { typeName: TestType.typeName, id: request.id }, ['attributes', 'relationships'] );
    }
  }).then(v => {
    return {
      data: v,
    };
  });
}

function handlePost(request, data): Promise<PackagedModelData> {
  return backingStore.writeAttributes(data).then(v => {
    return {
      data: v,
    };
  });
}

function handlePatchAttributes(request, data): Promise<PackagedModelData> {
  return backingStore.writeAttributes(
    Object.assign({}, data, { id: request.id, type: TestType.typeName })
  ).then(v => {
    return {
      data: v,
    };
  });
}

function handlePatchRelationship(request, data): Promise<PackagedModelData> {
  return backingStore.writeRelationshipItem(
    { typeName: TestType.typeName, id: request.id },
    request.relationship,
    { id: request.childId, meta: data },
  ).then(v => {
    return {
      data: v,
    };
  });
}

function handlePut(request, data): Promise<PackagedModelData> {
  return backingStore.writeRelationshipItem(
    { typeName: TestType.typeName, id: request.id },
    request.relationship,
    data,
  ).then(v => {
    return {
      data: v,
    };
  });
}

function handleDelete(request): Promise<PackagedModelData> {
  if (!request.relationship) {
    return backingStore.delete({ typeName: TestType.typeName, id: request.id })
    .then(v => {
      return {
        data: null,
      };
    });
  } else {
    return backingStore.deleteRelationshipItem(
      { typeName: TestType.typeName, id: request.id },
      request.relationship,
      { id: request.childId }
    )
    .then(v => {
      return {
        data: v,
      };
    });
  }
}

export const mockedAxios = Axios.create({
  baseURL: '',
  adapter: axiosAdapter,
});
