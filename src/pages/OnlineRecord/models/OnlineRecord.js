/*eslint-disable*/
import { getRecords } from '../service/onlineRecordService';
export  default{
  namespace: 'onlineRecord',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *getRecords({ payload,callback }, { call, put }) {
      const response = yield call(getRecords, payload);
      if (callback && !!response) callback(response.data);
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
