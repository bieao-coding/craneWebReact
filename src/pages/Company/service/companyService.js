/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/companies';
import info from '@/defaultInfo'
/*获取单位列表*/
export async function getCompanies(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
/*获取单个单位信息*/
export async function getCompanyById(params) {
  return request(`${baseUrl}/${params.id}?${stringify(params)}`);
}
/*添加单位*/
export async function addCompany(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑单位*/
export async function editCompany(params) {
  return request(`${baseUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}
