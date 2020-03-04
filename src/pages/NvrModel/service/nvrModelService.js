/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/nvrModel';
import info from '@/defaultInfo'
/*获取角色列表*/
export async function getNvrModels(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
/*获取单个角色信息*/
export async function getNvrModelById(id) {
  return request(`${baseUrl}/${id}`);
}
/*添加角色*/
export async function addNvrModel(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑角色*/
export async function editNvrModel(params) {
  return request(`${baseUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}
