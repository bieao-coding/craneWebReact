/*eslint-disable*/
import { getAllAntis } from '../service/allAntisService';
export  default{
  namespace: 'allAntis',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getAllAntis,payload);
      if(response) yield put({
        type: 'getList',
        payload: response.data,
      });
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
