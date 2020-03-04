/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const baseUrl = '/restful/v2/craneFactories';
const modelUrl = '/restful/v2/craneModels';
import info from '@/defaultInfo'
/*获取厂商列表*/
export async function getManufacturers(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
/*获取单个厂商信息*/
export async function getManufacturerById(craneFactoryId) {
  return request(`${baseUrl}/${craneFactoryId}`);
}
/*添加厂商*/
export async function addManufacturer(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑厂商*/
export async function editManufacturer(params) {
  return request(`${baseUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}
/*获取厂商型号列表*/
export async function getModels(params) {
  return request(`${modelUrl}/craneFactory/${params.craneFactoryId}?${stringify(params)}`);
}
/*获取单个厂商型号信息*/
export async function getModelById({craneFactoryId,id}) {
  return request(`${modelUrl}/${id}`);
}
/*添加厂商型号*/
export async function addModel(params) {
  return request(`${modelUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑厂商型号*/
export async function editModel(params) {
  return request(`${modelUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}
