/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const treeUrl = '/restful/v2/organizations';
const workLevelUrl = '/restful/v2/workData/summary/org/parent';

/*获取树*/
export async function getTree() {
  return request(`${treeUrl}`);
}

export async function getWorkLevel(params) {
  return request(`${workLevelUrl}/${params.id}?${stringify(params)}`);
}
