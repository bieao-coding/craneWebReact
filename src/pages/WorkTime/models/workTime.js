/*eslint-disable*/
import {getTree,getWorkTime} from "../service/workTimeService";
export  default{
  namespace: 'workTime',

  state: {
    list: [],
    total: 0
  },

  effects: {
    *getTree({ payload,callback }, { call, put }) {
      const response = yield call(getTree,payload);
      if (callback && !!response) callback(response.data);
    },
    *getWorkTime({ payload,callback }, { call, put }) {
      const response = yield call(getWorkTime,payload);
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
