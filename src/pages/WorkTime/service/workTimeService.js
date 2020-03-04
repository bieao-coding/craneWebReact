/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const treeUrl = '/restful/v2/organizations';
const workTimeUrl = '/restful/v2/runTime/summary/org/parent';  //  集团下面的公司

/*获取树*/
export async function getTree() {
  return request(`${treeUrl}`);
}

export async function getWorkTime(params) {
  return request(`${workTimeUrl}/${params.id}?${stringify(params)}`);
}
