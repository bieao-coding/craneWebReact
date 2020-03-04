/*eslint-disable*/
import { getProjects,getProjectById,editProject } from '../service/glodonService';
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
