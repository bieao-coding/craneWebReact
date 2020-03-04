/*eslint-disable*/
import { getAllAntis,getAnalyse,getOrgData} from '../service/analyseOnlineService';
export  default{
  namespace: 'analyseOnline',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *getAllAntis({ payload,callback }, { call, put }) {
      const response = yield call(getAllAntis,payload);
      if (callback && !!response) callback(response.data);
    },
    *getAnalyse({ payload,callback }, { call, put }) {
      const response = yield call(getAnalyse,payload);
      if (callback && !!response) callback(response.data);
    },
    *getOrgData({ payload,callback }, { call, put }) {
      const response = yield call(getOrgData,payload);
      if (callback && !!response) callback(response.data);
    },
  },

  reducers: {

  },
};
