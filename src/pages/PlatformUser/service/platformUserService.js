/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/users';
const companyUrl = '/restful/v2/companies';
const roleUrl = '/restful/v2/roles';
const projectUrl = '/restful/v2/projects';
const treeUrl = '/restful/v2/organizations';
const operatorUrl = '/restful/v2/workers';
const nvrUrl = '/restful/v2/nvr';
const antiUrl = '/restful/v2/antiDevices';
const videoUrl = '/restful/v2/videoDevices';
import info from '@/defaultInfo'
/*获取工程列表*/
export async function getProjects(params) {
  return request(`${projectUrl}?${stringify(params)}`);
}
/*获取用户列表*/
export async function getUsers() {
  return request(`${baseUrl}`);
}
/*获取单位列表*/
export async function getCompanies(params) {
  return request(`${companyUrl}?${stringify(params)}`);
}
/*获取角色列表*/
export async function getRoles(params) {
  return request(`${roleUrl}?${stringify(params)}`);
}
/*获取单个用户信息*/
export async function getUserById(userId) {
  return request(`${baseUrl}/${userId}`);
}
/*添加用户*/
export async function addUser(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑用户*/
export async function editUser(params) {
  return request(`${baseUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}
/*删除角色*/
export async function deleteUser(userId) {
  return request(`${baseUrl}/${userId}`,{
    method: 'DELETE',
  });
}
/*编辑密码*/
export async function editPassword(params) {
  return request(`${baseUrl}/${params.userId}/password`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}

/*更新工程*/
export async function bindProject(params) {
  return request(`${baseUrl}/${params.userId}/projects` , {
    method: 'PUT',
    body: '[' + params.list.join() + ']',
  });
}
/*获取组织树*/
export async function getOrganization() {
  return request(`${treeUrl}`);
}
/*获取已选组织*/
export async function getSelectOrganization(params) {
  return request(`${treeUrl}/user/${params.userId}?${stringify(params)}`);
}
export async function saveOrganization(params) {
  return request(`${treeUrl}/user/${params.userId}`, {
    method: 'PUT',
    body: {...params},
  });
}
/*获取塔司*/
export async function getOperators(params) {
  return request(`${operatorUrl}?${stringify(params)}`);
}
/*获取已选塔司*/
export async function getSelectOperators(userId) {
  return request(`${operatorUrl}/user/${userId}`);
}
/*保存塔司*/
export async function saveOperators(params) {
  const newList = params.list.map((item)=>'"' + item + '"');
  return request(`${operatorUrl}/user/${params.userId}`, {
    method: 'PUT',
    body: '[' + newList.join() + ']',
  });
}
/*获取NVR*/
export async function getNvr(params) {
  return request(`${nvrUrl}?${stringify(params)}`);
}
/*获取已选NVR*/
export async function getSelectNvr(userId) {
  return request(`${nvrUrl}/user/${userId}`);
}
/*保存nvr*/
export async function saveNvr(params) {
  return request(`${nvrUrl}/user/${params.userId}`, {
    method: 'PUT',
    body: '[' + params.list.join() + ']',
  });
}
/*获取防碰撞*/
export async function getAntiDev(params) {
  return request(`${antiUrl}?${stringify(params)}`);
}
/*获取已选防碰撞*/
export async function getSelectAntiDev(userId) {
  return request(`${antiUrl}/user/${userId}`);
}
export async function saveAntiDev(params) {
  const newList = params.list.map((item)=>'"' + item + '"');
  return request(`${antiUrl}/user/${params.userId}`, {
    method: 'PUT',
    body: '[' + newList.join() + ']',
  });
}
/*获取视频*/
export async function getVideoDev(params) {
  return request(`${videoUrl}?${stringify(params)}`);
}
/*获取已选防碰撞*/
export async function getSelectVideoDev(userId) {
  return request(`${videoUrl}/user/${userId}`);
}
export async function saveVideoDev(params) {
  const newList = params.list.map((item)=>'"' + item + '"');
  return request(`${videoUrl}/user/${params.userId}`, {
    method: 'PUT',
    body: '[' + newList.join() + ']',
  });
}
/*重置密码*/
export async function resetPassword(userId) {
  return request(`${baseUrl}/${userId}/password/reset`, {
    method: 'PUT'
  });
}
