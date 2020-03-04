/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/deviceOnline/record';
/*获取角色列表*/
export async function getRecords(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
