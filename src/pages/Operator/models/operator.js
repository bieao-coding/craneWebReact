/*eslint-disable*/
import { getOperators,getOperatorById,addOperator,editOperator,deleteOperator,getOperatorByCardId } from '../service/operatorService';
export  default{
  namespace: 'operator',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getOperators,payload);
      if(response) yield put({
        type: 'getList',
        payload: response.data,
      });
    },
    *getEdit({ payload,callback }, { call, put }) {
      const response = yield call(getOperatorById, payload);
      if (callback && !!response) callback(response.data);
    },
    *add({ payload,callback }, { call }) {
      const response =  yield call(addOperator, payload);
      if (callback) callback(response);
    },
    *edit({ payload,callback }, { call }) {
      const response =  yield call(editOperator, payload);
      if (callback) callback(response);
    },
    *delete({ payload,callback }, { call }) {
      const response =  yield call(deleteOperator, payload);
      if (callback) callback(response);
    },
    *getFeature({ payload,callback }, { call }){
      const response =  yield call(getOperatorByCardId, payload);
      if (callback) callback(response);
    },
    *setPage({ payload }, { call, put }){
      yield put({
        type: 'modify',
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
    },
    modify(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    }
  },
};
