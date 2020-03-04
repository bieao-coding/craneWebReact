/*eslint-disable*/
import {getUsers,getUserById,addUser,editUser,getCompanies,getRoles,deleteUser,editPassword,
  getProjects,bindProject,getOrganization,saveOrganization,getOperators,getSelectOperators,saveOperators,resetPassword,
  getNvr,saveNvr,getAntiDev,saveAntiDev,getVideoDev,saveVideoDev,getSelectNvr,getSelectOrganization,getSelectAntiDev,getSelectVideoDev} from '../service/platformUserService';
export  default{
  namespace: 'platformUser',

  state: {
    pageNumber:0,
  },

  effects: {
    *getUsers({ payload,callback }, { call, put }) {
      const response = yield call(getUsers,payload);
      if (callback && !!response) callback(response.data);
    },
    *getCompanies({payload, callback }, { call, put }) {
      const response = yield call(getCompanies,payload);
      if (callback && !!response) callback(response.data);
    },
    *getRoles({ payload,callback }, { call, put }) {
      const response = yield call(getRoles,payload);
      if (callback && !!response) callback(response.data);
    },
    *getEdit({ payload,callback }, { call }) {
      const response = yield call(getUserById, payload);
      if (callback && !!response) callback(response.data);
    },
    *add({ payload,callback }, { call }) {
      const response =  yield call(addUser, payload);
      if (callback) callback(response);
    },
    *edit({ payload,callback }, { call }) {
      const response =  yield call(editUser, payload);
      if (callback) callback(response);
    },
    *delete({ payload,callback }, { call }) {
      const response =  yield call(deleteUser, payload);
      if (callback) callback(response);
    },
    *password({ payload,callback }, { call }) {
      const response =  yield call(editPassword, payload);
      if (callback) callback(response);
    },
    *getProjects({ payload,callback }, { call, put }) {
      const response = yield call(getProjects,payload);
      if (callback && !!response) callback(response.data);
    },
    *bindProject({ payload,callback }, { call, put }) {
      const response = yield call(bindProject,payload);
      if (callback && !!response) callback(response);
    },
    *getOrganization({ payload,callback }, { call, put }){
      const response = yield call(getOrganization,payload);
      if (callback && !!response) callback(response.data);
    },
    *getSelectOrganization({ payload,callback }, { call, put }){
      const response = yield call(getSelectOrganization,payload);
      if (callback && !!response) callback(response.data);
    },
    *saveOrganization({ payload,callback }, { call, put }){
      const response = yield call(saveOrganization,payload);
      if (callback && !!response) callback(response);
    },
    *getOperators({ payload,callback }, { call, put }){
      const response = yield call(getOperators,payload);
      if (callback && !!response) callback(response.data);
    },
    *getSelectOperators({ payload,callback }, { call, put }){
      const response = yield call(getSelectOperators,payload);
      if (callback && !!response) callback(response.data);
    },
    *saveOperators({ payload,callback }, { call, put }){
      const response = yield call(saveOperators,payload);
      if (callback && !!response) callback(response);
    },
    *getNvr({ payload,callback }, { call, put }){
      const response = yield call(getNvr,payload);
      if (callback && !!response) callback(response.data);
    },
    *getSelectNvr({ payload,callback }, { call, put }){
      const response = yield call(getSelectNvr,payload);
      if (callback && !!response) callback(response.data);
    },
    *saveNvr({ payload,callback }, { call, put }){
      const response = yield call(saveNvr,payload);
      if (callback && !!response) callback(response);
    },
    *getAntiDev({ payload,callback }, { call, put }){
      const response = yield call(getAntiDev,payload);
      if (callback && !!response) callback(response.data);
    },
    *getSelectAntiDev({ payload,callback }, { call, put }){
      const response = yield call(getSelectAntiDev,payload);
      if (callback && !!response) callback(response.data);
    },
    *saveAntiDev({ payload,callback }, { call, put }){
      const response = yield call(saveAntiDev,payload);
      if (callback && !!response) callback(response);
    },
    *getVideoDev({ payload,callback }, { call, put }){
      const response = yield call(getVideoDev,payload);
      if (callback && !!response) callback(response.data);
    },
    *getSelectVideoDev({ payload,callback }, { call, put }){
      const response = yield call(getSelectVideoDev,payload);
      if (callback && !!response) callback(response.data);
    },
    *saveVideoDev({ payload,callback }, { call, put }){
      const response = yield call(saveVideoDev,payload);
      if (callback && !!response) callback(response);
    },
    *resetPassword({ payload,callback }, { call, put }){
      const response = yield call(resetPassword,payload);
      if (callback && !!response) callback(response);
    },
    *setPage({ payload }, { call, put }){
      yield put({
        type: 'modify',
        payload: payload,
      });
    },
  },

  reducers: {
    modify(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    }
  },
};
