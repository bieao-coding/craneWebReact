/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const treeUrl = '/restful/v2/organizations';
const baseUrl = '/restful/v2/videoUpgrade';
const versionUrl = '/restful/v2/videoVersions';
/*获取树*/
export async function getTree() {
  return request(`${treeUrl}`);
}
/*获取更新列表*/
export async function getCranes(params) {
  return request(`${baseUrl}/upgradeInfo/${params.projectId}?${stringify(params)}`);
}
/*获取版本列表*/
export async function getVersions(params) {
  return request(`${versionUrl}?${stringify(params)}`);
}
/*获取塔机列表*/
export async function getRefresh(params) {
  return request(`${baseUrl}/progress/${params.projectId}?${stringify(params)}`);
}
