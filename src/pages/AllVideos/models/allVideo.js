/*eslint-disable*/
import { getAllVideos } from '../service/allVideoService.js';
export  default{
  namespace: 'allVideos',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getAllVideos,payload);
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
