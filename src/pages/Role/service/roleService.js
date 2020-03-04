/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/roles';
const routeUrl = '/restful/v2/routes/role';
import info from '@/defaultInfo'
/*获取角色列表*/
export async function getRoles(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
/*获取单个角色信息*/
export async function getRoleById(roleId) {
  return request(`${baseUrl}/${roleId}`);
}
/*添加角色*/
export async function addRole(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑角色*/
export async function editRole(params) {
  return request(`${baseUrl}`, {
    method:'PUT',
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

/*获取单个角色权限*/
export async function getAuth(roleId) {
  return request(`${routeUrl}/${roleId}`);
}

/*保存权限*/
export async function saveAuth(params) {
  const checkItem = params.checkItem;
  const routers = checkItem.map((item)=>{
    return {routeKey:item}
  });
  return request(`${routeUrl}/${params.roleId}`,{
    method: 'PUT',
    body: JSON.stringify(routers),
  });
}
