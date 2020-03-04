/*eslint-disable*/
import request from '@/utils/request';
import { stringify } from 'qs';
import fetch from "dva/fetch";
import info from '@/defaultInfo'
import { setAuthority } from '@/utils/authority';
const ironUrl = '/zftd/api/service/loginByCRBIMUID';  //获取铁总userId
const platformUrl = '/restful/v2/tie/sync/foreignUser';  //获取平台用户
const companyUrl = '/zftd/api/service/getProjectsByUserId';  //获取公司
const projectUrl = '/zftd/api/service/getBuildsByUserId';  //获取工程
const platformProjectUrl = '/restful/v2/tie/sync/foreignProject';  //保存工程
const craneUrl = '/zftd/api/crane/getCranelistByBuildId';  //获取塔机
const platformCraneUrl = '/restful/v2/tie/sync/foreignCrane';  //保存塔机
const prefix = '/zftdsd/crane';
/*获取铁总userId*/
export async function getIronUser(params) {
  return fetch(`${prefix + ironUrl}?${stringify(params)}`,{
    method: 'GET',
    mode: 'cors',
  }).then(res => {
    if(res.status === 200){
      return res.json();
    }else{
      return null
    }
  })
}
/*获取平台用户*/
export async function getPlatformUser(params) {
  const body = {
    url:platformUrl,
    method:'POST',
    contentType:'application/json; charset=utf-8',
    token:'',
    content:JSON.stringify(params).replace(/\'/g, '\"')
  };
  return fetch(`/zftdsd/crane/restful/v2/redirect`,{
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
    }).then((res) => {
        if(res){
          if(res.status === 200){
            return res.json();
          }else{
            return null
          }
        }
      })
}
/*获取施工单位*/
export async function getCompanies(params){
  return fetch(`${prefix + companyUrl}?${stringify(params)}`,{
    method: 'GET',
    mode: 'cors',
  }).then(res => {
    if(res.status === 200){
      return res.json();
    }else{
      return null
    }
  })
}

/*获取工程*/
export async function getProjects(params){
  return fetch(`${prefix + projectUrl}?${stringify(params)}`,{
    method: 'GET',
    mode: 'cors',
  }).then(res => {
    if(res.status === 200){
      return res.json();
    }else{
      return null
    }
  })
}

/*保存工程*/
export async function saveProjects(params){
  return request(`${platformProjectUrl}`, {
    method: 'POST',
    body: {
      ...params
    },
  });
}

/*获取塔机*/
export async function getCranes(params){
  return fetch(`${prefix + craneUrl}?${stringify(params)}`,{
    method: 'GET',
    mode: 'cors',
  }).then(res => {
    if(res.status === 200){
      return res.json();
    }else{
      return null
    }
  })
}

/*保存塔机*/
export async function saveCranes(params){
  return request(`${platformCraneUrl}`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

