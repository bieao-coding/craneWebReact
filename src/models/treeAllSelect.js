/*eslint-disable*/
export default {
  namespace: 'treeAllSelect',

  state: {
    // 在线监控的塔机默认选择
    defaultCraneId:null,
    // 树默认选择
    companySelect:{1:null,2:null,3:null},
    defaultCompany:null,
  },

  effects: {
    *modifySelect({ payload }, { call, put }) {
      yield put({
        type: 'modify',
        payload: payload,
      });
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
