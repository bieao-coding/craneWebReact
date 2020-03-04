import {editPassword} from "../service/settingService";

export default {
  namespace: 'accountSetting',

  state: {
    province: [],
    city: [],
    isLoading: false,
  },

  effects: {
    *password({ payload,callback }, { call }) {
      const response =  yield call(editPassword, payload);
      if (callback) callback(response);
    },
  },

  reducers: {

  },
};
