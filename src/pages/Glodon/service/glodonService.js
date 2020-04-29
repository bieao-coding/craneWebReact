/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/glodon/projects';
import info from '@/defaultInfo'

export async function getProjects(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}

export async function getProjectById(id) {
  return request(`${baseUrl}/${id}`);
}

export async function getOtherProject(id) {
  return request(`${baseUrl}/other/${id}`);
}

export async function editProject(params) {
  return request(`${baseUrl}`, {
    method:'PUT',
    body: {
      ...params
    },
  });
}

export async function otherProject(params) {
  return request(`${baseUrl}`, {
    method:'POST',
    body: {
      ...params
    },
  });
}
