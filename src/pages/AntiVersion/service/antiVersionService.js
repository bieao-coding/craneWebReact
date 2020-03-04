/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/antiFirmware';
import info from '@/defaultInfo'
/*获取版本列表*/
export async function getVersions(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
/*添加版本*/
export async function addVersion(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: params,
  });
}
/*删除版本*/
export async function deleteVersion(versionId) {
  return request(`${baseUrl}/${versionId}`,{
    method: 'DELETE',
  });
}
