/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const treeUrl = '/restful/v2/organizations';
const peccancyUrl = '/restful/v2/peccancy/summary/org/parent';
const details = '/restful/v2/peccancy/record/org';
/*获取树*/
export async function getTree() {
  return request(`${treeUrl}`);
}

export async function getPeccancy(params) {
  return request(`${peccancyUrl}/${params.id}?${stringify(params)}`);
}
/*获取详情*/
export async function getPeccancyDetails(params) {
  return request(`${details}/${params.id}?${stringify(params)}`);
}
