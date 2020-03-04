/*eslint-disable*/
import { getRoles,addRole,editRole,getRoleById,deleteRole,saveAuth,getAuth } from '../service/roleService';
export  default{
  namespace: 'role',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getRoles,payload);
      if(response) yield put({
        type: 'getList',
        payload: response.data,
      });
    },
    *getEdit({ payload,callback }, { call, put }) {
      const response = yield call(getRoleById, payload);
      if (callback && !!response) callback(response.data);
    },
    *add({ payload,callback }, { call }) {
      const response =  yield call(addRole, payload);
      if (callback) callback(response);
    },
    *edit({ payload,callback }, { call }) {
      const response =  yield call(editRole, payload);
      if (callback) callback(response);
    },
    *delete({ payload,callback }, { call }) {
      const response =  yield call(deleteRole, payload);
      if (callback) callback(response);
    },
    *getAuth({ payload,callback }, { call }){
      const response =  yield call(getAuth, payload);
      if (callback) callback(response.data);
    },
    *saveAuth({ payload,callback }, { call }){
      const response =  yield call(saveAuth, payload);
      if (callback) callback(response);
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
