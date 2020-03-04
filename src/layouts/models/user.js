/*eslint-disable*/
const getAuthorization = (data) => {
  const obj = {};
  for(const item of data){
    if(!obj[item]){
      obj[item] = true;
    }
  }
  return obj;
};
import {getUserInfo,getJavaVersion} from "../service/user";
import { reloadAuthorized } from '@/utils/Authorized';
import { routerRedux } from 'dva/router';
import info from '@/defaultInfo'
export  default{
  namespace: 'user',

  state: {
    currentUser: {},
    authorization:[]
  },

  effects: {
    *getUserInfo({ payload,callback,nextDo }, { call, put }) {
      const response = yield call(getUserInfo);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
      if(callback) callback();
      if(nextDo) nextDo()
    },
    *getJavaVersion({ payload,callback }, { call, put }) {
      const response = yield call(getJavaVersion);
      if (callback && !!response) callback(response.data);
    },
    *logout({ payload }, { call, put }){
      sessionStorage.removeItem('Authorization');
      sessionStorage.removeItem('Roles');
      reloadAuthorized();
      if(info.isIron){
        window.location = 'http://www.r93535.com'
      }else{
        yield put(
          routerRedux.push({
            pathname: '/user/login',
          })
        );
      }
    }
  },

  reducers: {
    saveCurrentUser(state, action) {
      const currentUser = action.payload.data || {};
      const routeKey = !!currentUser.routeKey ? currentUser.routeKey : [];
      sessionStorage.setItem('Roles',JSON.stringify(routeKey));
      reloadAuthorized();
      return {
        ...state,
        currentUser: currentUser,
        authorization:getAuthorization(routeKey)
      };
    },
  },
};
