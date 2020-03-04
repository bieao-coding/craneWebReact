/*eslint-disable*/
import { stringify } from 'qs';
import request from '@/utils/request';
const projectUrl = '/restful/v2/projects/parent';
const companyUrl = '/restful/v2/companies/parent';
/*获取工程列表*/
export async function getContents({type,params}) {
  return request(`${type ? projectUrl : companyUrl}/${params.companyId}?${stringify(params)}`);
}
