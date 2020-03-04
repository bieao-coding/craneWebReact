/*eslint-disable*/
import { getNvrs,addNvr,editNvr,getNvrById,getNvrModels,getNvrCranes,addDevice,getToken,cancelPassword } from '../service/nvrService';
export  default{
  namespace: 'nvr',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getNvrs,payload);
      if(response) yield put({
        type: 'getList',
        payload: response.data,
      });
    },
    *getEdit({ payload,callback }, { call, put }) {
      const response = yield call(getNvrById, payload);
      if (callback && !!response) callback(response.data);
    },
    *add({ payload,callback }, { call }) {
      const response =  yield call(addNvr, payload);
      if (callback) callback(response);
    },
    *edit({ payload,callback }, { call }) {
      const response =  yield call(editNvr, payload);
      if (callback) callback(response);
    },
    *getNvrModels({ payload,callback }, { call }){
      const response =  yield call(getNvrModels, payload);
      if (callback) callback(response.data);
    },
    *getNvrCranes({ payload,callback }, { call }){
      const response =  yield call(getNvrCranes, payload);
      if (callback) callback(response.data);
    },
    *getToken({ payload,callback }, { call, put }){
      const response = yield call(getToken,payload);
      if(response && callback) callback(response)
    },
    *addDevice({ payload,callback }, { call, put }){
      const response = yield call(addDevice,payload);
      if(response && callback) callback(response)
    },
    *cancelPassword({ payload,callback }, { call, put }){
      const response = yield call(cancelPassword,payload);
      if(response && callback) callback(response)
    },
    *setPage({ payload }, { call, put }){
      yield put({
        type: 'modify',
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
    },
    modify(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    }
  },
};
