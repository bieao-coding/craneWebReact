/*eslint-disable*/
import { stringify } from 'qs';
import {serialize} from '@/utils/utils'
import request from '@/utils/request';
import fetch from "dva/fetch";
/*塔机列表以及单台塔机*/
const baseUrl = '/restful/v2/cranes';
const treeUrl = '/restful/v2/organizations';
/*群塔配置*/
const configUrl = '/restful/v2/craneGroup/config';
const runDataUrl = '/restful/v2/runData/recent/org';
const historyUrl = '/restful/v2/craneGroup/record/project';

/*塔机历史数据*/
const runDataRecord = '/restful/v2/runData/record/org';
/*吊重数据*/
const workRunRecord = '/restful/v2/workData/record/org';

const videoRunTime = '/restful/v2/videoRunTime';
const videoRunTimeLog = '/restful/v2/videoRunTimeRecord';
const antiRunTime = '/restful/v2/runTime/recent/org';
const antiRunTimeLog = '/restful/v2/runTime/record/org';
const getTokenUrl ='https://open.ys7.com/api/lapp/token/get';
const checkDeviceUrl ='https://open.ys7.com/api/lapp/device/info';
const closePassword = 'https://open.ys7.com/api/lapp/device/encrypt/off';
const addDeviceUrl ='https://open.ys7.com/api/lapp/device/add';
const liveUrl = 'https://open.ys7.com/api/lapp/live/video/open';
const getAddressUrl = 'https://open.ys7.com/api/lapp/live/address/get';
const closeLive = 'https://open.ys7.com/api/lapp/live/video/close';
const nvrUrl = '/restful/v2/videoManager';
const videoPullUrl = '/restful/v2/videoPull';
const pdfUrl = '/restful/v2/sgp/pdf/runData/crane';
import info from '@/defaultInfo'
/*获取树*/
export async function getTree() {
  return request(`${treeUrl}`);
}
/*获取塔机列表*/
export async function getCranes(params) {
  return request(`${baseUrl}/parent/${params.projectId}?${stringify(params)}`);
}
/*保存配置信息*/
export async function saveConfig(params){
  return request(`${configUrl}/cranes`, {
    method: 'PUT',
    body: params,
  });
}
/*保存配置信息*/
export async function saveBottom(params){
  return request(`${configUrl}/project`, {
    method: 'POST',
    body: params,
  });
}
/*获取塔机配置信息*/
export async function getConfig(projectId) {
  return request(`${configUrl}/project/${projectId}`);
}
/*获取工地底图*/
export async function getBottomPicture(projectId) {
  return request(`${configUrl}/project/picture/${projectId}`);
}
/*获取俯视图实时数据*/
export async function getRunData(projectId) {
  return request(`${runDataUrl}/${projectId}`);
}
/*获取塔机历史运行数据*/
export async function getHistoryData(params) {
  return request(`${historyUrl}/${params.projectId}?${stringify(params)}`);
}
/*获取单台塔机配置信息*/
export async function getSignalCrane(craneId) {
  return request(`${baseUrl}/${craneId}`);
}
/*获取单台塔机运行数据*/
export async function getSignalRunData(craneId) {
  return request(`${runDataUrl}/${craneId}`);
}

/*获取塔机运行数据*/
export async function getRunDataRecord(params) {
  return request(`${runDataRecord}/${params.craneId}?${stringify(params)}`);
}

/*获取吊重运行数据*/
export async function getWorkRunRecord(params) {
  return request(`${workRunRecord}/${params.craneId}?${stringify(params)}`);
}

/*获取防碰撞运行时间*/
export async function getAntiRunTime(craneId) {
  return request(`${antiRunTime}/${craneId}`);
}

/*获取防碰撞运行Log*/
export async function getAntiRunTimeLog(params) {
  return request(`${antiRunTimeLog}/${params.craneId}?${stringify(params)}`);
}

/*获取视频运行时间*/
export async function getVideoRunTime(params) {
  return request(`${videoRunTime}?${stringify(params)}`);
}

/*获取视频运行时间log*/
export async function getVideoRunTimeLog(params) {
  return request(`${videoRunTimeLog}?${stringify(params)}`);
}
/*获取NVR信息*/
export async function getNvrInfo(craneId) {
  return request(`${nvrUrl}/${craneId}`);
}
/*下载PDF*/
export async function downPDF(params) {
  return request(`${pdfUrl}/${params.craneId}?${stringify(params)}`);
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
/*关闭设备密码*/
export async function closeDevicePassword(params) {
  return fetch(`${closePassword}`,{
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

