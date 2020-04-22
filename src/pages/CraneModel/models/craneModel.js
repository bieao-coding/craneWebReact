/*eslint-disable*/
import { getManufacturers,getManufacturerById,addManufacturer,editManufacturer,
  getModels,getModelById,addModel,editModel} from '../service/craneModelService';
export  default{
  namespace: 'craneModel',

  state: {
    list: [],
    total: 0,
    manufacturerPageNumber:0,
    manufacturerPageSize:10,
    modelPageNumber:0,
    modelPageSize:10,
  },

  effects: {
    *getManufacturers({ payload }, { call, put }) {
      const response = yield call(getManufacturers,payload);
      if(response) yield put({
        type: 'getList',
        payload: response.data,
      });
    },
    *getManufacturerEdit({ payload,callback }, { call, put }) {
      const response = yield call(getManufacturerById, payload);
      if (callback && !!response) callback(response.data);
    },
    *addManufacturer({ payload,callback }, { call }) {
      const response =  yield call(addManufacturer, payload);
      if (callback) callback(response);
    },
    *editManufacturer({ payload,callback }, { call }) {
      const response =  yield call(editManufacturer, payload);
      if (callback) callback(response);
    },
    *getModels({ payload,callback }, { call }) {
      const response = yield call(getModels, payload);
      if (callback && !!response) callback(response.data);
    },
    *getModelEdit({ payload,callback }, { call, put }) {
      const response = yield call(getModelById, payload);
      if (callback && !!response) callback(response.data);
    },
    *addModel({ payload,callback }, { call }) {
      const response =  yield call(addModel, payload);
      if (callback) callback(response);
    },
    *editModel({ payload,callback }, { call }) {
      const response =  yield call(editModel, payload);
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
