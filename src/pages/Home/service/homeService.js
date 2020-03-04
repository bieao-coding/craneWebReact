/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';

const topUrl = '/restful/v2/dashboard/summary';
const centerWarningUrl = '/restful/v2/warning/summary/user/parent';
const centerAlarmUrl = '/restful/v2/alarm/summary/user/parent';
const centerPeccancyUrl = '/restful/v2/peccancy/summary/user/parent';
const warningDetailsUrl = '/restful/v2/warning/record/user';
const alarmDetailsUrl = '/restful/v2/alarm/record/user';
const peccancyDetailsUrl = '/restful/v2/peccancy/record/user';
/*首页第一栏*/
export async function getTop(params) {
  return request(`${topUrl}?${stringify(params)}`);
}
/*首页第二栏*/
export async function getCenterWarning(params) {
  return request(`${centerWarningUrl}/${params.userId}?${stringify(params)}`);
}
/*首页第二栏*/
export async function getCenterAlarm(params) {
  return request(`${centerAlarmUrl}/${params.userId}?${stringify(params)}`);
}
/*首页第二栏*/
export async function getCenterPeccancy(params) {
  return request(`${centerPeccancyUrl}/${params.userId}?${stringify(params)}`);
}
/*首页第三栏*/
export async function getWarningDetails(params) {
  return request(`${warningDetailsUrl}/${params.userId}?${stringify(params)}`);
}
/*首页第三栏*/
export async function getAlarmDetails(params) {
  return request(`${alarmDetailsUrl}/${params.userId}?${stringify(params)}`);
}
/*首页第三栏*/
export async function getPeccancyDetails(params) {
  return request(`${peccancyDetailsUrl}/${params.userId}?${stringify(params)}`);
}
