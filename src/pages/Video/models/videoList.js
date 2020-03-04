/*eslint-disable*/
import { getVideos,addVideo,getBingRecord} from '../service/videoService';
export  default{
  namespace: 'videoList',

  state: {
    list: [],
    total: 0,
    pageNumber:0,
    pageSize:10
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getVideos,payload);
      if(response) yield put({
        type: 'getList',
        payload: response.data,
      });
    },
    *add({ payload,callback }, { call }) {
      const response =  yield call(addVideo, payload);
      if (callback) callback(response);
    },
    *getBingRecord({ payload,callback }, { call }) {
      const response =  yield call(getBingRecord, payload);
      if (callback) callback(response);
    },
    *setPage({ payload }, { call, put }){
      yield put({
        type: 'getList',
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
    }
  },
};
