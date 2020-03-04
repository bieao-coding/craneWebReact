/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/sgp/contacts';
/*获取联系人列表*/
export async function getContacts(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
/*获取单个联系人信息*/
export async function getContactById(contactId) {
  return request(`${baseUrl}/${contactId}`);
}
/*添加联系人*/
export async function addContact(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑联系人*/
export async function editContact(params) {
  return request(`${baseUrl}`,{
    method: 'PUT',
    body: {
      ...params
    },
  });
}
/*删除联系人*/
export async function deleteContact(contactId) {
  return request(`${baseUrl}/${contactId}`,{
    method: 'DELETE',
  });
}
