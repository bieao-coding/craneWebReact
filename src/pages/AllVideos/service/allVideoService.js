/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/utils/videoDevices';
/*获取角色列表*/
export async function getAllVideos(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
