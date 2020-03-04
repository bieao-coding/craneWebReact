/*eslint-disable*/
import {getTree,getCranes,getAntis,getVideos,addCrane,editCrane,getCraneContacts,getAllContacts,deleteContact,
  getCraneById,getRecord,getCompanies,getManufacturers,getModels,getCraneNvr,addNvr,editNvr,getNvrs,saveContact,
  addDevice, checkDevice, getLiveAddress, getToken,closeDeviceLive, openLive,getCraneWorks,saveOperators,
  getWorkerRate,getProperty,getBingRecord,getSgpCraneExt,saveSgpCraneExt,addSgpCraneExt} from "../service/craneService";
export  default{
  namespace: 'crane',

  state: {
    craneId:null,
    projectId:null,
    addList:[],
    copyList:[],
    pageObj:{}
  },

  effects: {
    *getTree({ payload,callback }, { call, put }) {
      const response = yield call(getTree,payload);
      if (callback && !!response) callback(response.data);
    },
    *getCranes({ payload,callback }, { call, put }) {
      const response = yield call(getCranes,payload);
      if(response && callback) callback(response.data)
    },
    *getCompanies({ payload,callback }, { call, put }){
      const response = yield call(getCompanies,payload);
      if(response && callback) callback(response.data)
    },
    *getAntiList({ payload,callback }, { call, put }){
      const response = yield call(getAntis,payload);
      if(response && callback) callback(response.data)
    },
    *getVideoList({ payload,callback }, { call, put }){
      const response = yield call(getVideos,payload);
      if(response && callback) callback(response.data)
    },
    *getFactoryList({ payload,callback }, { call, put }){
      const response = yield call(getManufacturers,payload);
      if(response && callback) callback(response.data)
    },
    *getModelList({ payload,callback }, { call, put }){
      const response = yield call(getModels,payload);
      if(response && callback) callback(response.data)
    },
    *getEdit({ payload,callback }, { call, put }) {
      const response = yield call(getCraneById, payload);
      if (callback && !!response) callback(response.data);
    },
    *add({ payload,callback }, { call }) {
      const response =  yield call(addCrane, payload);
      if (response && callback) callback(response);
    },
    *edit({ payload,callback }, { call }) {
      const response =  yield call(editCrane, payload);
      if (response && callback) callback(response);
    },
    *getRecord({ payload,callback }, { call }){
      const response = yield call(getRecord,payload);
      if (callback && !!response) callback(response.data);
    },
    *getNvrs({ payload,callback }, { call }) {
      const response = yield call(getNvrs, payload);
      if (callback) callback(response.data);
    },
    *getCraneNvr({ payload,callback }, { call }) {
      const response =  yield call(getCraneNvr, payload);
      if (response && callback) callback(response.data);
    },
    *addNvr({ payload,callback }, { call }) {
      const response =  yield call(addNvr, payload);
      if (response && callback) callback(response);
    },
    *editNvr({ payload,callback }, { call }) {
      const response =  yield call(editNvr, payload);
      if (response && callback) callback(response);
    },
    *getToken({ payload,callback }, { call, put }){
      const response = yield call(getToken,payload);
      if(response && callback) callback(response)
    },
    *checkDevice({ payload,callback }, { call, put }){
      const response = yield call(checkDevice,payload);
      if(response && callback) callback(response)
    },
    *addDevice({ payload,callback }, { call, put }){
      const response = yield call(addDevice,payload);
      if(response && callback) callback(response)
    },
    *getLiveAddress({ payload,callback }, { call, put }){
      const response = yield call(getLiveAddress,payload);
      if(response && callback) callback(response)
    },
    *openLive({ payload,callback }, { call, put }){
      const response = yield call(openLive,payload);
      if(response && callback) callback(response)
    },
    *closeLive({ payload,callback }, { call, put }){
      const response = yield call(closeDeviceLive,payload);
      if(response && callback) callback(response)
    },
    *getCraneWorks({ payload,callback }, { call, put }){
      const response = yield call(getCraneWorks,payload);
      if(response && callback) callback(response.data)
    },
    *saveOperators({ payload,callback }, { call, put }){
      const response = yield call(saveOperators,payload);
      if(response && callback) callback(response)
    },
    *getWorkerRate({ payload,callback }, { call }) {
      const response =  yield call(getWorkerRate, payload);
      if (response && callback) callback(response.data);
    },
    *getProperty({ payload,callback }, { call }){
      const response =  yield call(getProperty, payload);
      if (response && callback) callback(response.data);
    },
    *getBingRecord({ payload,callback }, { call }) {
      const response =  yield call(getBingRecord, payload);
      if (response && callback) callback(response);
    },
    *getCraneContacts({ payload,callback }, { call }) {
      const response =  yield call(getCraneContacts, payload);
      if (response && callback) callback(response.data);
    },
    *getAllContacts({ payload,callback }, { call }) {
      const response =  yield call(getAllContacts, payload);
      if (response && callback) callback(response.data);
    },
    *saveContact({ payload,callback }, { call }) {
      const response =  yield call(saveContact, payload);
      if (response && callback) callback(response);
    },
    *deleteContact({ payload,callback }, { call }) {
      const response =  yield call(deleteContact, payload);
      if (response && callback) callback(response);
    },
    *modifySelect({ payload }, { call, put }) {
      yield put({
        type: 'modify',
        payload: payload,
      });
    },
    *setPage({ payload }, { call, put }){
      yield put({
        type: 'modify',
        payload: payload,
      });
    },
    *getSgpCraneExt({ payload,callback }, { call }) {
      const response =  yield call(getSgpCraneExt, payload);
      if (response && callback) callback(response.data);
    },
    *addSgpCraneExt({ payload,callback }, { call }) {
      const response =  yield call(addSgpCraneExt, payload);
      if (response && callback) callback(response);
    },
    *saveSgpCraneExt({ payload,callback }, { call }) {
      const response =  yield call(saveSgpCraneExt, payload);
      if (response && callback) callback(response);
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
