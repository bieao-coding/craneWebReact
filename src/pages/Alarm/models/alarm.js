/*eslint-disable*/
import {getTree,getAlarm,getAlarmDetails} from "../service/alarmService";
export  default{
  namespace: 'alarm',

  state: {
    list: [],
    total: 0
  },

  effects: {
    *getTree({ payload,callback }, { call, put }) {
      const response = yield call(getTree,payload);
      if (callback && !!response) callback(response.data);
    },
    *getAlarm({ payload,callback }, { call, put }) {
      const response = yield call(getAlarm,payload);
      if (callback && !!response) callback(response.data);
    },
    *getAlarmDetails({ payload,callback }, { call, put }) {
      const response = yield call(getAlarmDetails,payload);
      if (callback && !!response) callback(response.data);
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
