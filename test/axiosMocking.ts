import { MemoryStore, ModelData, Schema, Model } from 'plump';
import Axios, { AxiosResponse, AxiosInstance } from 'axios';
import { TestType } from './testType';

const backingStore = new MemoryStore({ terminal: true });
@Schema({
  name: 'datedTests',
  idAttribute: 'id',
  attributes: {
    id: { type: 'number', readOnly: true },
    name: { type: 'string' },
    when: { type: 'date' },
  },
  relationships: {},
})
class DatedType extends Model<ModelData> {
  static type = 'datedTests';
}
export function init() {
  return backingStore.addSchemas([TestType, DatedType]);
}

function axiosAdapter(config): Promise<AxiosResponse> {
  return Promise.resolve()
    .then(() => {
      const method = config.method;
      const matchBase = config.url.match(new RegExp(`^/(\\w+)`));
      const matchItem = config.url.match(new RegExp(`^/(\\w+)/(\\d+)`));
      const matchSideBase = config.url.match(
        new RegExp(`^/(\\w+)/(\\d+)/(\\w+)$`),
      );
      const matchSideItem = config.url.match(
        new RegExp(`^/(\\w+)/(\\d+)/(\\w+)/(\\d+)$`),
      );
      const viewMatch =
        config.url.indexOf('?view=') >= 0
          ? config.url.substr(config.url.indexOf('?view=') + '?view='.length)
          : false;
      const match =
        matchSideItem || matchSideBase || matchItem || matchBase || [];

      const request = {
        typeCheck: match.length === 1,
        type: match[1],
        id: parseInt(match[2], 10),
        relationship: match[3],
        childId: parseInt(match[4], 10),
        view: viewMatch,
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
          config: config,
        };
        return retVal;
      } else {
        return {
          status: 404,
          statusText: 'Not found.',
          headers: '',
          config: config,
          data: null,
        };
      }
    });
}

function handleGet(request): Promise<ModelData> {
  return Promise.resolve().then(() => {
    if (request.relationship) {
      return backingStore.readRelationship({
        item: { type: request.type, id: request.id },
        fields: [`relationships.${request.relationship}`],
        rel: request.relationship,
      });
    } else if (request.view) {
      return {
        type: request.type,
        id: request.id,
        attributes: {},
        relationships: {},
        [request.view]: true,
      };
    } else {
      return backingStore.read({
        item: { type: request.type, id: request.id },
        fields: ['attributes', 'relationships'],
      });
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
    Object.assign({}, data, { id: request.id, type: request.type }),
  );
}

function handlePatchRelationship(request, data): Promise<ModelData> {
  return backingStore.writeRelationshipItem(
    { type: request.type, id: request.id },
    request.relationship,
    { id: request.childId, type: request.type, meta: data },
  );
}

function handlePut(request, data): Promise<ModelData> {
  return backingStore.writeRelationshipItem(
    { type: request.type, id: request.id },
    request.relationship,
    data,
  );
}

function handleDelete(request): Promise<ModelData | void> {
  if (!request.relationship) {
    return backingStore.delete({ type: request.type, id: request.id });
  } else {
    return backingStore.deleteRelationshipItem(
      { type: request.type, id: request.id },
      request.relationship,
      { id: request.childId, type: request.type },
    );
  }
}

export const mockedAxios: AxiosInstance = Axios.create({
  baseURL: '',
  adapter: axiosAdapter,
});
