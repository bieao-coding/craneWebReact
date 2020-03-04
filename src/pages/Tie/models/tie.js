/*eslint-disable*/
import {getTree,saveTie  } from '../service/tieService';
export  default{
  namespace: 'tie',

  state: {
    list: [],
    total: 0
  },

  effects: {
    *getTree({ payload,callback }, { call, put }) {
      const response = yield call(getTree,payload);
      if (callback && !!response) callback(response.data);
    },
    *saveTie({ payload,callback }, { call }){
      const response =  yield call(saveTie, payload);
      if (callback) callback(response);
    }
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
