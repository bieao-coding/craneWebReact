/*eslint-disable*/
import {getTop,getCenterWarning,getCenterAlarm,getCenterPeccancy,getWarningDetails,getAlarmDetails,getPeccancyDetails} from "../service/homeService";
export  default{
  namespace: 'home',

  state: {
    list: [],
    total: 0
  },

  effects: {
    *getTop({ payload,callback }, { call, put }){
      const response = yield call(getTop,payload);
      if(response && callback) callback(response.data)
    },
    *getCenterWarning({ payload,callback }, { call, put }){
      const response = yield call(getCenterWarning,payload);
      if(response && callback) callback(response.data)
    },
    *getCenterAlarm({ payload,callback }, { call, put }){
      const response = yield call(getCenterAlarm,payload);
      if(response && callback) callback(response.data)
    },
    *getCenterPeccancy({ payload,callback }, { call, put }){
      const response = yield call(getCenterPeccancy,payload);
      if(response && callback) callback(response.data)
    },
    *getAlarmRunData({ payload,callback }, { call, put }){
      const response = yield call(getAlarmRunData,payload);
      if(response && callback) callback(response.data)
    },
    *getWarningDetails({ payload,callback }, { call, put }){
      const response = yield call(getWarningDetails,payload);
      if(response && callback) callback(response.data)
    },
    *getAlarmDetails({ payload,callback }, { call, put }){
      const response = yield call(getAlarmDetails,payload);
      if(response && callback) callback(response.data)
    },
    *getPeccancyDetails({ payload,callback }, { call, put }){
      const response = yield call(getPeccancyDetails,payload);
      if(response && callback) callback(response.data)
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
