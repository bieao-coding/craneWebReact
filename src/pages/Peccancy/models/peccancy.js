/*eslint-disable*/
import {getTree,getPeccancy,getPeccancyDetails} from "../service/peccancyService";
export  default{
  namespace: 'peccancy',

  state: {
    list: [],
    total: 0
  },

  effects: {
    *getTree({ payload,callback }, { call, put }) {
      const response = yield call(getTree,payload);
      if (callback && !!response) callback(response.data);
    },
    *getPeccancy({ payload,callback }, { call, put }) {
      const response = yield call(getPeccancy,payload);
      if (callback && !!response) callback(response.data);
    },
    *getPeccancyDetails({ payload,callback }, { call, put }) {
      const response = yield call(getPeccancyDetails,payload);
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
