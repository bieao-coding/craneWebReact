/*eslint-disable*/
import { getProjects,getProjectById,editProject,getOtherProject, otherProject } from '../service/glodonService';
export  default{
  namespace: 'glodon',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getProjects,payload);
      if(response) yield put({
        type: 'getList',
        payload: response.data,
      });
    },
    *getEdit({ payload,callback }, { call, put }) {
      const response = yield call(getProjectById, payload);
      if (callback && !!response) callback(response.data);
    },
    *getOtherProject({ payload,callback }, { call, put }) {
      const response = yield call(getOtherProject, payload);
      if (callback && !!response) callback(response.data);
    },
    *otherProject({ payload,callback }, { call }) {
      const response =  yield call(otherProject, payload);
      if (callback) callback(response);
    },
    *edit({ payload,callback }, { call }) {
      const response =  yield call(editProject, payload);
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
