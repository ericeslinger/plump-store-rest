import { MemoryStore } from 'plump';
import * as axios from 'axios';
import Promise from 'bluebird';

const backingStore = new MemoryStore({ terminal: true });

function mockup(t) {
  const mockedAxios = axios.create({ baseURL: '' });
  mockedAxios.defaults.adapter = (config) => {
    let apiWrap = true; // should we wrap in standard JSON API at the bottom
    return Promise.resolve().then(() => {
      const matchBase = config.url.match(new RegExp(`^/${t.$name}$`));
      const matchItem = config.url.match(new RegExp(`^/${t.$name}/(\\d+)$`));
      const matchSideBase = config.url.match(new RegExp(`^/${t.$name}/(\\d+)/(\\w+)$`));
      const matchSideItem = config.url.match(new RegExp(`^/${t.$name}/(\\d+)/(\\w+)/(\\d+)$`));


      if (config.method === 'get') {
        if (matchBase) {
          return Promise.all([
            backingStore.query(),
            Promise.resolve([]),
          ]);
        } else if (matchItem) {
          return Promise.all([
            backingStore.read(t, parseInt(matchItem[1], 10)),
            Promise.resolve([{
              type: t.$name,
              id: 2,
              attributes: {
                name: 'frotato',
                extended: {},
              },
              relationships: {},
            }]),
          ]);
        } else if (matchSideBase) {
          apiWrap = false;
          return Promise.all([
            backingStore.read(t, parseInt(matchSideBase[1], 10), matchSideBase[2]),
            Promise.resolve([]),
          ]);
        }
      } else if (config.method === 'post') {
        if (matchBase) {
          return Promise.all([
            backingStore.write(t, JSON.parse(config.data)),
            Promise.resolve([]),
          ]);
        }
      } else if (config.method === 'patch') {
        if (matchItem) {
          return Promise.all([
            backingStore.write(
              t,
              Object.assign(
                {},
                JSON.parse(config.data),
                { [t.$id]: parseInt(matchItem[1], 10) }
              )
            ),
            Promise.resolve([]),
          ]);
        } else if (matchSideItem) {
          return Promise.all([
            backingStore.modifyRelationship(
              t,
              parseInt(matchSideItem[1], 10),
              matchSideItem[2],
              parseInt(matchSideItem[3], 10),
              JSON.parse(config.data)
            ),
            Promise.resolve([]),
          ]);
        }
      } else if (config.method === 'put') {
        if (matchSideBase) {
          apiWrap = false;
          const relationshipBlock = t.$fields[matchSideBase[2]];
          const sideInfo = relationshipBlock.relationship.$sides[matchSideBase[2]];
          return Promise.all([
            backingStore.add(
              t,
              parseInt(matchSideBase[1], 10),
              matchSideBase[2],
              JSON.parse(config.data)[sideInfo.other.field],
              JSON.parse(config.data)
            ),
            Promise.resolve([]),
          ]);
        }
      } else if (config.method === 'delete') {
        if (matchItem) {
          return Promise.all([
            backingStore.delete(t, parseInt(matchItem[1], 10)),
            Promise.resolve([]),
          ]);
        } else if (matchSideItem) {
          apiWrap = false;
          return Promise.all([
            backingStore.remove(
              t,
              parseInt(matchSideItem[1], 10),
              matchSideItem[2],
              parseInt(matchSideItem[3], 10)
            ),
            Promise.resolve([]),
          ]);
        }
      }
      return Promise.reject({ response: { status: 400 } });
    }).then(([data, included]) => {
      // console.log('FOR');
      // console.log(config);
      // console.log(`RESOLVING ${JSON.stringify(d)}`);
      if (data) {
        if (apiWrap) {
          return { data, included };
        } else {
          return {
            data,
          };
        }
      } else {
        return Promise.reject({ response: { status: 404 } });
      }
    });
  };
  return mockedAxios;
}

const axiosMock = {
  mockup,
};

export default axiosMock;
