import { MemoryStore, ModelData } from 'plump';
import Axios, { AxiosResponse, AxiosInstance } from 'axios';
import { TestType } from './testType';

const backingStore = new MemoryStore({ terminal: true });
export function init() {
  return backingStore.addSchema(TestType);
}

function axiosAdapter(config): Promise<AxiosResponse> {
  return Promise.resolve()
    .then(() => {
      const method = config.method;
      const matchBase = config.url.match(new RegExp(`^/${TestType.type}$`));
      const matchItem = config.url.match(
        new RegExp(`^/${TestType.type}/(\\d+)$`)
      );
      const matchSideBase = config.url.match(
        new RegExp(`^/${TestType.type}/(\\d+)/(\\w+)$`)
      );
      const matchSideItem = config.url.match(
        new RegExp(`^/${TestType.type}/(\\d+)/(\\w+)/(\\d+)$`)
      );
      const match =
        matchSideItem || matchSideBase || matchItem || matchBase || [];

      const request = {
        typeCheck: match.length === 1,
        id: parseInt(match[1], 10),
        relationship: match[2],
        childId: parseInt(match[3], 10)
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
    })
    .then((data: ModelData | ModelData) => {
      if (data) {
        const retVal: AxiosResponse = {
          data: data,
          status: 200,
          statusText: 'OK',
          headers: '',
          config: config
        };
        return retVal;
      } else {
        return {
          status: 404,
          statusText: 'Not found.',
          headers: '',
          config: config,
          data: null
        };
      }
    });
}

function handleGet(request): Promise<ModelData> {
  return Promise.resolve().then(() => {
    if (request.relationship) {
      return backingStore.readRelationship(
        { type: TestType.type, id: request.id },
        request.relationship
      );
    } else {
      return backingStore.read({ type: TestType.type, id: request.id }, [
        'attributes',
        'relationships'
      ]);
    }
    // }).then(v => {
    //   return {
    //     data: v,
    //   };
  });
}

function handlePost(request, data): Promise<ModelData> {
  return backingStore.writeAttributes(data);
}

function handlePatchAttributes(request, data): Promise<ModelData> {
  return backingStore.writeAttributes(
    Object.assign({}, data, { id: request.id, type: TestType.type })
  );
}

function handlePatchRelationship(request, data): Promise<ModelData> {
  return backingStore.writeRelationshipItem(
    { type: TestType.type, id: request.id },
    request.relationship,
    { id: request.childId, meta: data }
  );
}

function handlePut(request, data): Promise<ModelData> {
  return backingStore.writeRelationshipItem(
    { type: TestType.type, id: request.id },
    request.relationship,
    data
  );
}

function handleDelete(request): Promise<ModelData | void> {
  if (!request.relationship) {
    return backingStore.delete({ type: TestType.type, id: request.id });
  } else {
    return backingStore.deleteRelationshipItem(
      { type: TestType.type, id: request.id },
      request.relationship,
      { id: request.childId }
    );
  }
}

export const mockedAxios: AxiosInstance = Axios.create({
  baseURL: '',
  adapter: axiosAdapter
});
