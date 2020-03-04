/*eslint-disable*/
import { getAntis,addAnti,getBingRecord} from '../service/antiService';
export  default{
  namespace: 'antiList',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getAntis,payload);
      if(response) yield put({
        type: 'getList',
        payload: response.data,
      });
    },
    *add({ payload,callback }, { call }) {
      const response =  yield call(addAnti, payload);
      if (callback) callback(response);
    },
    *getBingRecord({ payload,callback }, { call }) {
      const response =  yield call(getBingRecord, payload);
      if (callback) callback(response);
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
