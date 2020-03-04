/*eslint-disable*/
import { setAuthority } from '@/utils/authority';

const getAuthorization = (data) => {
  const obj = {};
  for(const item of data){
    if(!obj[item]){
      obj[item] = true;
    }
  }
  return obj;
};
import {getIronUser,getPlatformUser,getCompanies,getProjects,saveProjects,
  getCranes,saveCranes} from "../service/autoLoginService";
export  default{
  namespace: 'autoLogin',

  state: {
    list: [],
    total: 0
  },

  effects: {
    *getIronUser({ payload,callback }, { call, put }) {
      const response = yield call(getIronUser,payload);
      if (callback) callback(response);
    },
    *getPlatformUser({ payload,callback }, { call, put }) {
      const response = yield call(getPlatformUser,payload);
      if(response.status === 'Success'){
        const token = response['Authorization'];
        setAuthority(token);
      }
      if (callback && !!response) callback(response);
    },
    *getCompanies({ payload,callback }, { call, put }) {
      const response = yield call(getCompanies,payload);
      if (callback) callback(response);
    },
    *getProjects({ payload,callback }, { call, put }) {
      const response = yield call(getProjects,payload);
      if (callback) callback(response);
    },
    *saveProjects({ payload,callback }, { call, put }) {
      const response = yield call(saveProjects,payload);
      if (callback) callback(response);
    },
    *getCranes({ payload,callback }, { call, put }) {
      const response = yield call(getCranes,payload);
      if (callback) callback(response);
    },
    *saveCranes({ payload,callback }, { call, put }) {
      const response = yield call(saveCranes,payload);
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
  },
};
