/*eslint-disable*/
import { getVersions,addVersion,deleteVersion} from '../service/antiVersionService';
export  default{
  namespace: 'antiVersion',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getVersions,payload);
      if(response) yield put({
        type: 'getList',
        payload: response.data,
      });
    },
    *add({ payload,callback }, { call }) {
      const response =  yield call(addVersion, payload);
      if (callback) callback(response);
    },
    *deleteVersion({ payload,callback }, { call }) {
      const response =  yield call(deleteVersion, payload);
      if (callback) callback(response);
    },
    *setPage({ payload }, { call, put }){
      yield put({
        type: 'getList',
        payload: payload,
      });
    },
  },

  reducers: {
    getList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    }
  },
};
