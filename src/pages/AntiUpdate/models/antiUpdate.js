/*eslint-disable*/
import {getProjects,getTree,getCranes,getVersions,getRefresh} from "../service/antiUpdateService";

export  default{
  namespace: 'antiUpdate',

  state: {
    list: [],
    total: 0,
    pageObj:{}
  },

  effects: {
    *getTree({ payload,callback }, { call, put }) {
      const response = yield call(getTree,payload);
      if (callback && !!response) callback(response.data);
    },
    *getCranes({ payload,callback }, { call, put }) {
      const response = yield call(getCranes,payload);
      if(callback && response){callback(response.data)}
    },
    *getVersion({ payload }, { call, put }) {
      const response = yield call(getVersions,payload);
      if(response) yield put({
        type: 'getList',
        payload: response.data,
      });
    },
    *getRefresh({ payload,callback }, { call, put }) {
      const response = yield call(getRefresh,payload);
      if(callback && response){callback(response.data)}
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
