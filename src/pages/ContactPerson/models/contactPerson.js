/*eslint-disable*/
import { getContacts,getContactById,addContact,editContact,deleteContact} from '../service/contactPersonService';
export  default{
  namespace: 'contactPerson',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getContacts,payload);
      if(response) yield put({
        type: 'getList',
        payload: response.data,
      });
    },
    *getEdit({ payload,callback }, { call, put }) {
      const response = yield call(getContactById, payload);
      if (callback && !!response) callback(response.data);
    },
    *add({ payload,callback }, { call }) {
      const response =  yield call(addContact, payload);
      if (callback) callback(response);
    },
    *edit({ payload,callback }, { call }) {
      const response =  yield call(editContact, payload);
      if (callback) callback(response);
    },
    *delete({ payload,callback }, { call }) {
      const response =  yield call(deleteContact, payload);
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
