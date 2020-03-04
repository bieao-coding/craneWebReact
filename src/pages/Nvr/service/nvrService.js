/*eslint-disable*/
import { stringify } from 'qs';
import {serialize} from '@/utils/utils'
import fetch from "dva/fetch";
import request from '@/utils/request';
const baseUrl = '/restful/v2/nvr';
const modelsUrl = '/restful/v2/nvrModel';
const getTokenUrl ='https://open.ys7.com/api/lapp/token/get';
const addDeviceUrl ='https://open.ys7.com/api/lapp/device/add';
const cancel = 'https://open.ys7.com/api/lapp/device/encrypt/off';
import info from '@/defaultInfo'
/*获取NVR列表*/
export async function getNvrs(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}
/*获取单个NVR信息*/
export async function getNvrById(nvrId) {
  return request(`${baseUrl}/${nvrId}`);
}
/*添加NVR*/
export async function addNvr(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑NVR*/
export async function editNvr(params) {
  return request(`${baseUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}

/*获取型号列表*/
export async function getNvrModels(params) {
  return request(`${modelsUrl}?${stringify(params)}`);
}
/*获取型号列表*/
export async function getNvrCranes(params) {
  return request(`${baseUrl}/${params.id}/details?${stringify(params)}`);
}
/*获取token*/
export async function getToken(params) {
  return fetch(`${getTokenUrl}`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    mode: 'cors',
    body: serialize(params),
  }).then(res => {
    return res.json();
  })
}
/*添加设备*/
export async function addDevice(params) {
  return fetch(`${addDeviceUrl}`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    mode: 'cors',
    body: serialize(params),
  }).then(res => {
    return res.json();
  })
}
/*取消加密*/
export async function cancelPassword(params) {
  return fetch(`${cancel}`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    mode: 'cors',
    body: serialize(params),
  }).then(res => {
    return res.json();
  })
}
