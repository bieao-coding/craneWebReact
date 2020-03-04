/*eslint-disable*/
import request from '@/utils/request';
const userInfoUrl = '/restful/v2/users/info';
const javaVersion = '/restful/v2/programVersion';
/*获取用户信息*/
export async function getUserInfo() {
  return request(`${userInfoUrl}`);
}
/*获取后台版本*/
export async function getJavaVersion() {
  return request(`${javaVersion}`);
}
