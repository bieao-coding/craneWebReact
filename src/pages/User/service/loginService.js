/*eslint-disable*/
import fetch from 'dva/fetch';
import router from "umi/router";
import request from '@/utils/request';
import info from '@/defaultInfo'
import { setAuthority } from '@/utils/authority';
const userInfoUrl = '/restful/v2/users/info';
const baseUrl = '/restful/v2/login';
export async function login(params) {
  if(info.isIron){
    const body = {
      url:baseUrl,
      method:'POST',
      contentType:'application/x-www-form-urlencoded',
      token:'',
      content:('username=' + params.username + '&' + 'password=' + encodeURIComponent(params.password)).replace(/\'/g, '\"')
    };
    return fetch('/zftdsd/crane/restful/v2/redirect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => {
      if(res){
        return res.json();
      }
    }).catch(err => {
        router.push('/user/login');
      });
  }else{
    return fetch(baseUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'username=' + params.username + '&' + 'password=' + encodeURIComponent(params.password),
    }).then((res) => {
      const token = res.headers.get('Authorization');
      setAuthority(token);
      if(res){
        return res.json();
      }
    }).catch(err => {
        router.push('/user/login');
      });
  }
}

/*获取用户信息*/
export async function getUserInfo() {
  return request(`${userInfoUrl}`);
}
