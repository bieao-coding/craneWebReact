/*eslint-disable*/
import {getTree,getCranes} from "../service/antiParamService";

export  default{
  namespace: 'antiParam',

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
      if(response && callback) callback(response.data)
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
