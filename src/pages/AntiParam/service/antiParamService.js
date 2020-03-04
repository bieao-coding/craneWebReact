/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const treeUrl = '/restful/v2/organizations';
const baseUrl = '/restful/v2/cranes';
/*获取树*/
export async function getTree() {
  return request(`${treeUrl}`);
}

/*获取塔机列表*/
export async function getCranes(params) {
  return request(`${baseUrl}/parent/${params.projectId}?${stringify(params)}`);
}
