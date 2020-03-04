/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const treeUrl = '/restful/v2/organizations';
const alarmUrl = '/restful/v2/alarm/summary/org/parent';
const details = '/restful/v2/alarm/record/org';
/*获取树*/
export async function getTree() {
  return request(`${treeUrl}`);
}

export async function getAlarm(params) {
  return request(`${alarmUrl}/${params.id}?${stringify(params)}`);
}
/*获取详情*/
export async function getAlarmDetails(params) {
  return request(`${details}/${params.id}?${stringify(params)}`);
}
