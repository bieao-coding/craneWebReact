/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const antiAllUrl = '/restful/v2/utils/antiDevices';
const analyseUrl = '/restful/v2/deviceOnline/analyse/summary';
const orgUrl = '/restful/v2/deviceOnline/analyse/record';
/*获取所有设备列表*/
export async function getAllAntis(params) {
  return request(`${antiAllUrl}?${stringify(params)}`);
}
/*获取所有设备详情*/
export async function getAnalyse(params) {
  return request(`${analyseUrl}?${stringify(params)}`);
}
/*获取所有设备详情*/
export async function getOrgData(params) {
  return request(`${orgUrl}?${stringify(params)}`);
}

