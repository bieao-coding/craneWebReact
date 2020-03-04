/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/videoDevices';
/*获取视频列表*/
export async function getVideos(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
/*添加视频sn*/
export async function addVideo(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*获取sn的绑定记录*/
export async function getBingRecord(sn) {
  return request(`${baseUrl}/bindRecord/${sn}`);
}
