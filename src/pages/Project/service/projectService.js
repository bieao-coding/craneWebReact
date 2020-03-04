/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/projects';
const companyUrl = '/restful/v2/companies';
const sgpUrl = '/restful/v2/sgp/projectExt';
import info from '@/defaultInfo'
/*获取工程列表*/
export async function getProjects(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
/*获取单位列表*/
export async function getCompanies(params) {
  return request(`${companyUrl}?${stringify(params)}`);
}
/*获取单个工程信息*/
export async function getProjectById(projectId) {
  return request(`${baseUrl}/${projectId}`);
}
/*添加工程*/
export async function addProject(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑工程*/
export async function editProject(params) {
  return request(`${baseUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}
/*删除角色*/
export async function deleteRole(roleId) {
  return request(`${baseUrl}/${roleId}`,{
    method: 'DELETE',
  });
}
/*获取单个工程的扩展*/
export async function getSgpProjectExt(projectId) {
  return request(`${sgpUrl}/${projectId}`);
}
/*获取单个工程的扩展*/
export async function addSgpProjectExt(params) {
  return request(`${sgpUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*获取单个工程的扩展*/
export async function saveSgpProjectExt(params) {
  return request(`${sgpUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}
