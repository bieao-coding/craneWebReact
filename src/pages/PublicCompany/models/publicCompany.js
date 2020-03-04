/*eslint-disable*/
import { getContents } from '../service/publicCompanyService';
export  default{
  namespace: 'publicCompany',

  state: {
    pageObj:{}
  },

  effects: {
    *getContents({ payload,callback }, { call, put }) {
      const response = yield call(getContents, payload);
      if (callback && !!response) callback(response.data);
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
    },
  },
};
