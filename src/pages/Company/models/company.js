/*eslint-disable*/
import { getCompanies,addCompany, getCompanyById,editCompany} from '../service/companyService';
export  default{
  namespace: 'company',

  state: {
    list: [],
    total: 0,
    workPageNumber:0,
    buildPageNumber:0,
    supervisionPageNumber:0,
    propertyPageNumber:0
  },

  effects: {
    *fetch({payload,callback}, { call, put }) {
      const response = yield call(getCompanies,payload);
      if(response && callback) callback(response.data)
    },
    *getEdit({ payload,callback }, { call, put }) {
      const response = yield call(getCompanyById, payload);
      if (callback && !!response) callback(response.data);
    },
    *add({ payload,callback }, { call }) {
      const response =  yield call(addCompany, payload);
      if (callback) callback(response);
    },
    *edit({ payload,callback }, { call }) {
      const response =  yield call(editCompany, payload);
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
