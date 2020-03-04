/*eslint-disable*/
import {getTree,getWorkLevel} from "../service/workLevelService";
export  default{
  namespace: 'workLevel',

  state: {
    list: [],
    total: 0
  },

  effects: {
    *getTree({ payload,callback }, { call, put }) {
      const response = yield call(getTree,payload);
      if (callback && !!response) callback(response.data);
    },
    *getWorkLevel({ payload,callback }, { call, put }) {
      const response = yield call(getWorkLevel,payload);
      if (callback && !!response) callback(response.data);
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
