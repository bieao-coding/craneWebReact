 /*eslint-disable*/
import moment from 'moment';
import React from 'react';
import nzh from 'nzh/cn';
import { parse, stringify } from 'qs';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {message} from 'antd';
const preValue = Math.PI / 180; // 计算弧度制专用
/*类型判断（大写）*/
const typeOf = (obj) => {
  const objStr = Object.prototype.toString.call(obj);
  return objStr.replace('[object ', '').replace(']', '');
};
/*判断children*/
const nodeChildren = (setting, node, newChildren) => {
  if (!node) {
    return null;
  }
  const key = setting.children;
  if (typeof newChildren !== 'undefined') {
    node[key] = newChildren;
  }
  return node[key];
};
export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}
/*返回提示消息*/
export function resMessage(res){
  const obj = {message : formatMessage({id:'app.common.error'}),type : 'error'};
  if(res && !!res.status){
    if(res.status === 'Success'){
      obj.message = formatMessage({id:'app.common.success'})
    }else if(res.status === 'Error'){
      obj.message = formatMessage({id:`app.common.${res.message.toLowerCase()}`})
    }else{
      obj.message = formatMessage({id:`app.common.${res.message.toLowerCase()}`}) + formatMessage({id:`app.common.${res.status.toLowerCase()}`})
    }
    obj.type = res.status === 'Success' ? 'success' : 'error';
  }
  message[obj.type](obj.message);
}
/*排序 0正序 1 倒叙*/
export function compare(prop,orderBy){
  return function (obj1, obj2) {
    const val1 = obj1[prop];
    const val2 = obj2[prop];
    if (val1 < val2) {
      return !orderBy ? -1 : 1;
    } else if (val1 > val2) {
      return !orderBy ? 1 : -1;
    } else {
      return 0;
    }
  }
}
/*平行树转children树*/
export function transPingTreeToChildren(setting, sNodes, extraSetting){//extraSetting = {name:[],value:[]}name:增加的key,value:取值的名,注意：保持一一对应
  let i, l;
  const key = setting.id;
  const parentKey = setting.pid;
  if (!key || key === "" || !sNodes) return [];
  if (typeOf(sNodes) === 'Array') {
    let r = [];
    const tmpMap = {};
    for (i = 0, l = sNodes.length; i < l; i++) {
      if(!!extraSetting){
        const name = extraSetting.name;
        const value = extraSetting.value;
        for(let y = 0; y < name.length; y++){
          sNodes[i][name[y]] = sNodes[i][value[y]];
        }
      }
      tmpMap[sNodes[i][key]] = sNodes[i];
    }
    for (i = 0, l = sNodes.length; i < l; i++) {
      const p = tmpMap[sNodes[i][parentKey]];
      if (p && sNodes[i][key] !== sNodes[i][parentKey]) {
        let children = nodeChildren(setting, p,undefined);
        if (!children) {
          children = nodeChildren(setting, p, []);
        }
        children.push(sNodes[i]);
      } else {
        r.push(sNodes[i]);
      }
    }
    return r;
  } else {
    return [sNodes];
  }
};
/*平行树转children树*/
export function transPingTreeToChildrenUnique(setting, sNodes, extraSetting){//extraSetting = {name:[],value:[]}name:增加的key,value:取值的名,注意：保持一一对应
  let i, l;
  const key = setting.id;
  const parentKey = setting.pid;
  if (!key || key === "" || !sNodes) return [];
  if (typeOf(sNodes) === 'Array') {
    let r = [];
    const tmpMap = {};
    for (i = 0, l = sNodes.length; i < l; i++) {
      const name = extraSetting.name;
      const value = extraSetting.value;
      sNodes[i][name[0]] = sNodes[i][value[0]] + '_' + i;
      sNodes[i][name[1]] = sNodes[i][value[1]];
      tmpMap[sNodes[i][value[0]] + '_' + i] = sNodes[i];
    }
    for (i = 0, l = sNodes.length; i < l; i++) {
      let p = undefined;
      const pid = sNodes[i][parentKey];
      for(const item of sNodes){
        if(item.level === sNodes[i].level - 1 && item.id === pid){
          p = item;
        }
      }
      if (p) {
        let children = nodeChildren(setting, p,undefined);
        if (!children) {
          children = nodeChildren(setting, p, []);
        }
        children.push(sNodes[i]);
      } else {
        r.push(sNodes[i]);
      }
    }
    return r;
  } else {
    return [sNodes];
  }
};
/*任意坐标转化为笛卡尔坐标*/
export function  translateAnglar(x,y, a, b){
  const newX =  x * Math.cos( b * preValue) - y * Math.sin(b * preValue);
  const newY = x * Math.sin(b * preValue) + y * Math.cos( b * preValue);
  return a == 1 ? [newX, newY] : [newY, newX];
}
/*塔机列表数据转换*/
export function transCraneData(json, groupNameArray, groupArray){
  const outArray = [];
  for (const item of json) {
    for (const col of groupArray) {
      const outObj = {};
      for(const arr of groupNameArray){
        outObj[arr] = item[arr];
      }
      for (const i in col) {
        outObj[groupArray[0][i]] = item[col[i]];
      }
      outArray.push(outObj);
    }
  }
  return outArray;
};
/*转化秒为天时分秒*/
export function transSecondsToFormat(data){
  let time = '';
  const day = data / (24 * 60 * 60);
  const hour = (data / (60 * 60)) % 24;
  const minute = (data / 60) % 60;
  const second = data % 60;
  if(!!Math.floor(day)) time = Math.floor(day) + formatMessage({id:'app.common.day'});
  time =  time + `${Math.floor(hour)}${formatMessage({id:'app.common.hour'})}${Math.floor(minute)}${formatMessage({id:'app.common.min'})}${Math.floor(second)}${formatMessage({id:'app.common.sen'})}`;
  return time;
}
export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  return nzh.toMoney(n);
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  }
  if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}

export function formatWan(val) {
  const v = val * 1;
  if (!v || Number.isNaN(v)) return '';

  let result = val;
  if (val > 10000) {
    result = Math.floor(val / 10000);
    result = (
      <span>
        {result}
        <span
          styles={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            lineHeight: 20,
            marginLeft: 2,
          }}
        >
          万
        </span>
      </span>
    );
  }
  return result;
}

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export function isAntdPro() {
  return false;
}

/*增删改cookies*/

//设置cookie
export function setCookie(name,value,day){
  const date = new Date();
  date.setDate(date.getDate() + day);
  document.cookie = name + '=' + value + ';expires='+ date;
};
//获取cookie
export function getCookie(name){
  const reg = RegExp(name+'=([^;]+)');
  const arr = document.cookie.match(reg);
  if(arr){
    return arr[1];
  }else{
    return '';
  }
};
/*序列化对象*/
export function serialize(obj){
  let str = '';
  let index = 0;
  for(const key in obj){
    if(!index) str += `${key}=${obj[key]}`;
    else str += `&${key}=${obj[key]}`;
    index++;
  }
  return str;
}
/*处理小数点*/
export function cutPoint(number,bit = 1){
  const num = Math.pow(10,bit);
  return Math.floor(number * num)/num;
}
/*递归处理-获取某一个节点以上的所有值 data:数据集 name:需要返回的字段,keyName:截至字段名,key:截至的id值*/
export function recursionTopToKey(data,name,keyName,key){
  let titles = [];
  for(const item of data){
    if(item.children){
      titles = recursionTopToKey(item.children,name,keyName,key);
      if(titles.length){
        titles.push(item[name]);
        break;
      }
    }
    if(item[keyName] === key){
      titles.push(item[name]);
      break;
    }
  }
  return titles
}
/*递归处理-获取某一个节点以下的所有值 data:数据集 keyName:匹配的字段,name:模糊匹配的值*/
export function recursionTopToObj(data,oldData,keyName,idName,parentIdName,name,flag,pid,array){
  for(const item of data){
    if(flag){
      array.push(item[idName]);
    }else if(item[keyName].indexOf(name) > -1){
      pid = item[parentIdName];
      const ids = recursionTopToKey(oldData,idName,idName,item[idName]);
      array = [...array,...ids];
      flag = true;
    }
    if(item.children){
      array = recursionTopToObj(item.children,oldData,keyName,idName,parentIdName,name,flag,pid,array);
    }
    if(item[parentIdName] === pid){
     flag = false;
    }
  }
 return array;
}

/*hasIndex:是否西显示下标还是内容， isFilter是否过滤相同的预警和报警*/
export function showAlarmInfo({warning,alarm,peccancy,isFilter,hasIndex}){
  const content = {warning:[],alarm:[],peccancy:[]};
  /*报警信息*/
  const alarmCode = {
    0:formatMessage({ id: 'app.common.left-collision' }),
    1:formatMessage({ id: 'app.common.right-collision' }),
    2:formatMessage({ id: 'app.common.radius-out-collision' }),
    3:formatMessage({ id: 'app.common.radius-into-collision' }),
    4:formatMessage({ id: 'app.common.left-area' }),
    5:formatMessage({ id: 'app.common.right-area' }),
    6:formatMessage({ id: 'app.common.radius-out-area' }),
    7:formatMessage({ id: 'app.common.radius-into-area' }),
    8:formatMessage({ id: 'app.common.slew-left-limit' }),
    9:formatMessage({ id: 'app.common.slew-right-limit' }),
    10:formatMessage({ id: 'app.common.radius-out-limit' }),
    11:formatMessage({ id: 'app.common.radius-into-limit' }),
    12:formatMessage({ id: 'app.common.height-up-limit' }),
    13:formatMessage({ id: 'app.common.height-down-limit' }),
    14:formatMessage({ id: 'app.common.force' }),
    15:formatMessage({ id: 'app.common.torque' }),
    16:formatMessage({ id: 'app.common.windSpeed' }),
  };
  const  array = [1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536];
  if(isFilter){
    array.forEach((item,index)=>{
      if(peccancy & item){
        content.peccancy.push(!hasIndex ? alarmCode[index] : index);
      }else if(alarm & item){
        content.alarm.push(!hasIndex ? alarmCode[index] : index);
      }else if(warning & item){
        content.warning.push(!hasIndex ? alarmCode[index] : index);
      }
    });
  }else{
    array.forEach((item,index)=>{
      warning & item ? content.warning.push(!hasIndex ? alarmCode[index] : index) : '';
      alarm & item ? content.alarm.push(!hasIndex ? alarmCode[index] : index) : '';
      peccancy & item ? content.peccancy.push(!hasIndex ? alarmCode[index] : index) : '';
    });
  }
  return content;
}
// 提取url上的参数
export function getUrlParams(){
  const args = {};
  const query = location.search.substring(1);
  const pairs = query.split('&');
  for(let i = 0; i < pairs.length;i++){
    const pos = pairs[i].indexOf('=');
    if(pos == -1) continue;
    const name = pairs[i].substring(0,pos);
    let value = pairs[i].substring(pos+1);
    value = decodeURIComponent(value);
    args[name] = value;
  }
  return args;
}

/*风速等级*/
 export function showWindGrade(windSpeed){
   let message = '',color = '';
   if(windSpeed < 0.3){
     message = formatMessage({id:'app.monitor.noWindow'});
   }else if(windSpeed < 1.6){
     message = formatMessage({id:'app.monitor.1F'});
   }else if(windSpeed < 3.4){
     message = formatMessage({id:'app.monitor.2F'});
   }else if(windSpeed < 5.5){
     message = formatMessage({id:'app.monitor.3F'});
   }else if(windSpeed < 8){
     message = formatMessage({id:'app.monitor.4F'});
   }else if(windSpeed < 10.8){
     color = 'orange';
     message = formatMessage({id:'app.monitor.5F'});
   }else if(windSpeed < 13.9){
     color = 'orange';
     message = formatMessage({id:'app.monitor.6F'});
   }else if(windSpeed < 17.2){
     color = 'orange';
     message = formatMessage({id:'app.monitor.7F'});
   }else if(windSpeed < 20.8){
     color = 'magenta';
     message = formatMessage({id:'app.monitor.8F'});
   }else if(windSpeed < 24.5){
     color = 'magenta';
     message = formatMessage({id:'app.monitor.9F'});
   }else if(windSpeed < 28.5){
     color = 'red';
     message = formatMessage({id:'app.monitor.10F'});
   }else if(windSpeed < 32.7){
     color = 'red';
     message = formatMessage({id:'app.monitor.11F'});
   }else{
     color = 'red';
     message = formatMessage({id:'app.monitor.12F'});
   }
   return {message,color};
 }
