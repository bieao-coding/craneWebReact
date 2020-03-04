/*eslint-disable*/
import { getProjects,getProjectById,addProject,editProject,getCompanies,getSgpProjectExt,saveSgpProjectExt,addSgpProjectExt } from '../service/projectService';
export  default{
  namespace: 'project',

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
    *getCompanies({payload, callback }, { call, put }) {
      const response = yield call(getCompanies,payload);
      if (callback && !!response) callback(response.data);
    },
    *getEdit({ payload,callback }, { call }) {
      const response = yield call(getProjectById, payload);
      if (callback && !!response) callback(response.data);
    },
    *add({ payload,callback }, { call }) {
      const response =  yield call(addProject, payload);
      if (callback) callback(response);
    },
    *edit({ payload,callback }, { call }) {
      const response =  yield call(editProject, payload);
      if (callback) callback(response);
    },
    *setPage({ payload }, { call, put }){
      yield put({
        type: 'modify',
        payload: payload,
      });
    },
    *getSgpExt({ payload,callback }, { call }) {
      const response =  yield call(getSgpProjectExt, payload);
      if (callback && !!response) callback(response.data);
    },
    *addSgpExt({ payload,callback }, { call }) {
      const response =  yield call(addSgpProjectExt, payload);
      if (callback) callback(response);
    },
    *saveSgpExt({ payload,callback }, { call }) {
      const response =  yield call(saveSgpProjectExt, payload);
      if (callback) callback(response);
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
