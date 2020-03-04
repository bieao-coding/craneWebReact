/*eslint-disable*/
import info from '@/defaultInfo'
import router from "umi/router";
import { login } from '../service/loginService';
import { setAuthority } from '@/utils/authority';
export default {
  namespace: 'login',

  state: {
    data:undefined,
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      if(info.isIron){
        const token = response['Authorization'];
        setAuthority(token);
      }
      // Login successfully
      if (response && response.status === 'Authorized') {
        yield put({
          type: 'user/getUserInfo',
          nextDo:()=>{
            router.push({pathname:'/'})
          }
        });
      }
    }
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
