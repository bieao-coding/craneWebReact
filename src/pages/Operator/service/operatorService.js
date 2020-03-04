/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/workers';
import info from '@/defaultInfo'
/*获取塔司列表*/
export async function getOperators(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
/*获取单个塔司信息*/
export async function getOperatorById(id) {
  return request(`${baseUrl}/${id}`);
}
/*获取单个塔司特征*/
export async function getOperatorByCardId(id) {
  return request(`${baseUrl}/${id}/feature`);
}
/*添加塔司*/
export async function addOperator(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑塔司*/
export async function editOperator(params) {
  return request(`${baseUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}
/*删除塔司*/
export async function deleteOperator(id) {
  return request(`${baseUrl}/${id}` ,{
    method: 'DELETE',
  });
}
