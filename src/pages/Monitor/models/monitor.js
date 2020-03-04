/*eslint-disable*/
import {getTree,getCranes,getConfig,getRunData,saveConfig,
  getSignalRunData,getSignalCrane,getHistoryData,getBottomPicture,downPDF,
  getRunDataRecord,getWorkRunRecord,getVideoRunTimeLog,getVideoRunTime,getAntiRunTimeLog,getAntiRunTime,getToken,
  checkDevice,addDevice,openLive,getLiveAddress,closeDevicePassword,closeDeviceLive,getNvrInfo,saveBottom} from "../service/monitorService";
export  default{
  namespace: 'monitor',

  state: {
    list: [],
    total: 0,
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
    *getConfig({ payload,callback }, { call, put }) {
      const response = yield call(getConfig,payload);
      if(response && callback) callback(response.data)
    },
    *getRunData({ payload,callback }, { call, put }) {
      const response = yield call(getRunData,payload);
      if(response && callback) callback(response.data)
    },
    *saveConfig({ payload,callback }, { call, put }) {
      const response = yield call(saveConfig,payload);
      if(response && callback) callback(response)
    },
    *getSignalCrane({ payload,callback }, { call, put }) {
      const response = yield call(getSignalCrane,payload);
      if(response && callback) callback(response.data)
    },
    *getSignalRunData({ payload,callback }, { call, put }) {
      const response = yield call(getSignalRunData,payload);
      if(response && callback) callback(response.data)
    },
    *getHistoryData({ payload,callback }, { call, put }){
      const response = yield call(getHistoryData,payload);
      if(response && callback) callback(response.data)
    },
    *getRunDataRecord({ payload,callback }, { call, put }){
      const response = yield call(getRunDataRecord,payload);
      if(response && callback) callback(response.data)
    },
    *getWorkRunRecord({ payload,callback }, { call, put }){
      const response = yield call(getWorkRunRecord,payload);
      if(response && callback) callback(response.data)
    },
    *getAntiRunTimeLog({ payload,callback }, { call, put }){
      const response = yield call(getAntiRunTimeLog,payload);
      if(response && callback) callback(response.data)
    },
    *getAntiRunTime({ payload,callback }, { call, put }){
      const response = yield call(getAntiRunTime,payload);
      if(response && callback) callback(response.data)
    },
    *getVideoRunTimeLog({ payload,callback }, { call, put }){
      const response = yield call(getVideoRunTimeLog,payload);
      if(response && callback) callback(response.data)
    },
    *getVideoRunTime({ payload,callback }, { call, put }){
      const response = yield call(getVideoRunTime,payload);
      if(response && callback) callback(response.data)
    },
    *getNvrInfo({ payload,callback }, { call, put }){
      const response = yield call(getNvrInfo,payload);
      if(response && callback) callback(response.data)
    },
    *getToken({ payload,callback }, { call, put }){
      const response = yield call(getToken,payload);
      if(response && callback) callback(response)
    },
    *checkDevice({ payload,callback }, { call, put }){
      const response = yield call(checkDevice,payload);
      if(response && callback) callback(response)
    },
    *closePassword({ payload,callback }, { call, put }){
      const response = yield call(closeDevicePassword,payload);
      if(response && callback) callback(response)
    },
    *addDevice({ payload,callback }, { call, put }){
      const response = yield call(addDevice,payload);
      if(response && callback) callback(response)
    },
    *openLive({ payload,callback }, { call, put }){
      const response = yield call(openLive,payload);
      if(response && callback) callback(response)
    },
    *getLiveAddress({ payload,callback }, { call, put }){
      const response = yield call(getLiveAddress,payload);
      if(response && callback) callback(response)
    },
    *closeLive({ payload,callback }, { call, put }){
      const response = yield call(closeDeviceLive,payload);
      if(response && callback) callback(response)
    },
    *saveBottom({ payload,callback }, { call, put }){
      const response = yield call(saveBottom,payload);
      if(response && callback) callback(response)
    },
    *getBottomPicture({ payload,callback }, { call, put }){
      const response = yield call(getBottomPicture,payload);
      if(response && callback) callback(response.data)
    },
    *downPDF({ payload,callback }, { call, put }){
      const response = yield call(downPDF,payload);
      if(response && callback) callback(response.data)
    },
    *setPage({ payload }, { call, put }){
      yield put({
        type: 'modify',
        payload: payload,
      });
    },
  }
  ,

  reducers: {
    modify(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
