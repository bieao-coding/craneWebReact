/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/utils/antiDevices';
const analyseUrl = '/restful/v2/deviceOnline/analyse/'
/*获取角色列表*/
export async function getAllAntis(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
