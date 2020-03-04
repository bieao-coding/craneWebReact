/*eslint-disable*/
import { stringify } from 'qs';
import {serialize} from '@/utils/utils'
import request from '@/utils/request';
import fetch from "dva/fetch";
const baseUrl = '/restful/v2/cranes';
const antiUrl = '/restful/v2/antiDevices/usableSn';
const videoUrl = '/restful/v2/videoDevices/usableSn';
const treeUrl = '/restful/v2/organizations';
const recordUrl = '/restful/v2/worker/record/crane';
const companyUrl = '/restful/v2/companies';
const factoryUrl = '/restful/v2/craneFactories';
const modelUrl = '/restful/v2/craneModels';
const craneWorker = '/restful/v2/workers/crane';
const nvrUrl = '/restful/v2/videoManager';
const nvrList = '/restful/v2/nvr';
const getTokenUrl ='https://open.ys7.com/api/lapp/token/get';
const checkDeviceUrl ='https://open.ys7.com/api/lapp/device/info';
const addDeviceUrl ='https://open.ys7.com/api/lapp/device/add';
const getAddressUrl = 'https://open.ys7.com/api/lapp/live/address/get';
const liveUrl = 'https://open.ys7.com/api/lapp/live/video/open';
const closeLive = 'https://open.ys7.com/api/lapp/live/video/close';
const rateUrl = '/restful/v2/workers/rate';
const propertyUrl = '/restful/v2/companies';
const contactBase = '/restful/v2/sgp/crane/contacts';
const allContactBase = '/restful/v2/sgp/contacts';
const sgpUrl = '/restful/v2/sgp/craneExt';
const faceStatusUrl = '/restful/v2/workers/crane/sync'
import info from '@/defaultInfo'
/*获取树*/
export async function getTree() {
  return request(`${treeUrl}`);
}
/*获取塔机列表*/
export async function getCranes(params) {
  return request(`${baseUrl}/parent/${params.projectId}?${stringify(params)}`);
}
/*获取单个塔机信息*/
export async function getCraneById(craneId) {
  return request(`${baseUrl}/${craneId}`);
}
/*获取sn信息*/
export async function getAntis() {
  return request(`${antiUrl}`);
}
/*获取sn信息*/
export async function getVideos() {
  return request(`${videoUrl}`);
}
/*获取sn信息*/
export async function getCompanies(params) {
  return request(`${companyUrl}?${stringify(params)}`);
}
/*获取sn信息*/
export async function getManufacturers(params) {
  return request(`${factoryUrl}?${stringify(params)}`);
}
/*获取厂商型号列表*/
export async function getModels(params) {
  return request(`${modelUrl}/craneFactory/${params.craneFactoryId}?${stringify(params)}`);
}
/*获取打卡记录信息*/
export async function getRecord(params) {
  return request(`${recordUrl}/${params.craneId}?${stringify(params)}`);
}
/*添加塔机*/
export async function addCrane(params) {
  return request(`${baseUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑塔机*/
export async function editCrane(params) {
  return request(`${baseUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}
/*获取所有的nvr信息*/
export async function getNvrs(params) {
  return request(`${nvrList}?${stringify(params)}`);
}
/*获取塔机的NVR信息*/
export async function getCraneNvr(craneId) {
  return request(`${nvrUrl}/${craneId}`);
}
/*查询塔机司机*/
export async function getCraneWorks(craneId) {
  return request(`${craneWorker}/${craneId}`);
}
/*编辑塔机*/
export async function saveOperators(params) {
  return request(`${craneWorker}/${params.id}`, {
    method: 'PUT',
    body: '[' + params.list.join() + ']'
  });
}
/*添加视频*/
export async function addNvr(params) {
  return request(`${nvrUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
/*编辑视频*/
export async function editNvr(params) {
  return request(`${nvrUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
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
/*检查设备是否存在*/
export async function checkDevice(params) {
  return fetch(`${checkDeviceUrl}`,{
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
/*开通直播*/
export async function openLive(params) {
  return fetch(`${liveUrl}`,{
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
/*获取直播地址*/
export async function getLiveAddress(params) {
  return fetch(`${getAddressUrl}`,{
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
/*关闭直播*/
export async function closeDeviceLive(params) {
  return fetch(`${closeLive}`,{
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
/*模板处理*/
export async function getWorkerRate(craneId) {
  return request(`${rateUrl}/${craneId}`);
}
/*获取产权单位*/
export async function getProperty(params){
  return request(`${propertyUrl}?${stringify(params)}`);
}
/*获取sn的绑定记录*/
export async function getBingRecord(craneId) {
  return request(`${baseUrl}/bindRecord/${craneId}`);
}
/*获取联系人*/
export async function getCraneContacts(params){
  return request(`${contactBase}/${params.craneId}?${stringify(params)}`);
}
/*获取所有联系人*/
export async function getAllContacts(params){
  return request(`${allContactBase}?${stringify(params)}`);
}
/*删除*/
export async function deleteContact(id) {
  return request(`${contactBase}/${id}`, {
    method: 'DELETE'
  });
}
/*保存联系人*/
export async function saveContact(params) {
  return request(`${contactBase}/${params.craneId}/${params.welcome}`, {
    method: 'POST',
    body: JSON.stringify(params.list),
  });
}
/*获取所有联系人*/
export async function getSgpCraneExt(craneId){
  return request(`${sgpUrl}/${craneId}`);
}
/*保存联系人*/
export async function saveSgpCraneExt(params) {
  return request(`${sgpUrl}`, {
    method: 'PUT',
    body: {
      ...params
    },
  });
}
/*保存联系人*/
export async function addSgpCraneExt(params) {
  return request(`${sgpUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}
