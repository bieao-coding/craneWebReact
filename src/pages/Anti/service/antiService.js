/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/antiDevices';

/*获取防碰撞列表*/
export async function getAntis(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
/*添加防碰撞sn*/
export async function addAnti(params) {
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
