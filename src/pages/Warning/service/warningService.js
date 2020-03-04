/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const treeUrl = '/restful/v2/organizations';
const warningUrl = '/restful/v2/warning/summary/org/parent';  //  集团下面的公司
const details = '/restful/v2/warning/record/org';
/*获取树*/
export async function getTree() {
  return request(`${treeUrl}`);
}

export async function getWarning(params) {
  return request(`${warningUrl}/${params.id}?${stringify(params)}`);
}
/*获取详情*/
export async function getWarningDetails(params) {
  return request(`${details}/${params.id}?${stringify(params)}`);
}
