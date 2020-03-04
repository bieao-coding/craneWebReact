/*eslint-disable*/
import {getTree,getWarning,getWarningDetails} from "../service/warningService";
export  default{
  namespace: 'warning',

  state: {
    list: [],
    total: 0
  },

  effects: {
    *getTree({ payload,callback }, { call, put }) {
      const response = yield call(getTree,payload);
      if (callback && !!response) callback(response.data);
    },
    *getWarning({ payload,callback }, { call, put }) {
      const response = yield call(getWarning,payload);
      if (callback && !!response) callback(response.data);
    },
    *getWarningDetails({ payload,callback }, { call, put }) {
      const response = yield call(getWarningDetails,payload);
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
