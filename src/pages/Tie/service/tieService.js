/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const treeUrl = '/restful/v2/organization/tree';
const saveUrl = '/restful/v2/tie/editSendCraneId';

/*获取树*/
export async function getTree(params) {
  return request(`${treeUrl}/${params.userId}?${stringify(params)}`);
}
/*添加*/
export async function saveTie(params) {
  return request(`${saveUrl}`, {
    method: 'POST',
    body: '[' + params.join() + ']',
  });
}
