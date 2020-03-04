/*eslint-disable*/
import fetch from 'dva/fetch';
import router from 'umi/router';
import info from '@/defaultInfo'

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const errortext = response.statusText;
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
};
/*判断数据类型*/
const typeOf = obj => {
  const objStr = Object.prototype.toString.call(obj);
  return objStr.replace('[object ', '').replace(']', '');
};
export default function request(url, option) {
  const auth = sessionStorage.getItem('Authorization');
  const defaultOptions = {
    credentials: 'include',
    headers:{
      Authorization: auth ? auth : null,
    }
  };
  let newOptions = { ...defaultOptions, ...option };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT' || newOptions.method === 'DELETE') {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      if(typeOf(newOptions.body) === 'Object') newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  }
  if(info.isIron){
    const factUrl = url;
    const method = newOptions.method || 'GET';
    let contentType = 'application/json; charset=utf-8';
    const token = newOptions.headers['Authorization'] || '';
    let content = '';
    if(method !== 'GET'){
      content = newOptions.body.replace(/\'/g, '\"');
    }
    newOptions.body = JSON.stringify({url:factUrl,method,contentType,token,content});
    newOptions.method = 'POST';
    newOptions.headers['Content-Type'] = 'application/json; charset=utf-8';
    url = '/zftdsd/crane/restful/v2/redirect';
  }
  return fetch(url, newOptions)
    .then(checkStatus)
    .then(response => {
      if(response && response.status === 200){
        return response.json();
      }
    })
    .catch(e => {
     const status = e.name;
     if (status === 403) {
        router.push('/exception/403');
      }else if (status <= 504 && status >= 500) {
        router.push('/exception/500');
      }else if (status >= 404 && status < 422) {
        router.push('/exception/404')
      }else{
       router.push('/user/login');
      }
    });
}
