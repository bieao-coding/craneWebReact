/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {resMessage} from '@/utils/utils'
import {Row,Col} from 'antd';
import router from 'umi/router';
import { getPageQuery } from '@/utils/utils';
import styles from './AutoLogin.less';
import {stringify} from "qs";
import { reloadAuthorized } from '@/utils/Authorized';

@connect(({ autoLogin }) => ({
  autoLogin
}))
class AutoLogin extends Component {
  state = {
   requestInfo:'正在跳转,请稍等...'
  };
  sessionid = null;
  foreignInfo = {foreignUserId:null,foreignUsername:null,foreignAccount:null,foreignUserType:null};
  projects = {};
  cranes = [];
  /*DOM加载完成后执行*/
  componentDidMount() {
    // 108836
    const params = getPageQuery();
    const {crbimUid} = params;
    this.sessionid = crbimUid;
    this.getIronUser();
  }
  /*请求铁总用户ID*/
  getIronUser = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'autoLogin/getIronUser',
      payload:{crbimUid:this.sessionid},
      callback:(res)=>{
        if(!!res && !!res.user.userId){
          const {userId,username,account,usertype} = res.user;
          this.foreignInfo = {foreignUserId:userId,foreignUsername:username,foreignAccount:account,foreignUserType:usertype};
          this.getPlatformUser();
        }else{
          this.setState({requestInfo:'未授权，请联系管理员处理'})
        }
      }
    });
  };

  /*请求平台用户ID*/
  getPlatformUser = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'autoLogin/getPlatformUser',
      payload:this.foreignInfo,
      callback:(res)=>{
        if(!!res){
          if(res.status === 'Success'){
            reloadAuthorized();
            const msg = !res.message ? '用户已创建' : '用户已存在';
            console.log(`${msg},正在创建绑定工程...`);
            this.getCompanies();
          }
        }else{
          this.setState({requestInfo:'当前用户数据正在同步，请等待，若长时间无响应，请重新登录或联系管理员处理'})
        }
      }
    });
  };
  /*获取公司*/
  getCompanies(){
    const { dispatch } = this.props;
    const params = {userId:this.foreignInfo.foreignUserId};
    dispatch({
      type: 'autoLogin/getCompanies',
      payload:params,
      callback:(res)=>{
        if(!!res){
          this.projects = {foreignUserId:this.foreignInfo.foreignUserId,list:[]};
          if(res.projects.length){
            res.projects.forEach((item,index)=>{
              this.getProjects(item.id,item.name,index,res.projects.length);
            });
          }else{
            console.log('没有工程需要绑定，正在登首页...');
            setTimeout(()=>{
              this.getUserInfo();
            },1000)
          }
        }
        else{
          this.setState({requestInfo:'当前用户数据正在同步，请等待，若长时间无响应，请重新登录或联系管理员处理'})
        }
      }
    });
  }
  /*获取工程*/
  getProjects(companyId,companyName,index,total){
    const { dispatch } = this.props;
    const params = {userId:this.foreignInfo.foreignUserId,projectId:companyId};
    dispatch({
      type: 'autoLogin/getProjects',
      payload:params,
      callback:(res)=>{
        if(!!res){
          res.builds.forEach((item)=>{
            this.projects.list.push({foreignProjectId:item.id,foreignProjectName:item.name,foreignCompanyId:companyId,foreignCompanyName:companyName});
          });
          if((index + 1) === total) this.saveProjects();
        }else{
          this.setState({requestInfo:'当前用户数据正在同步，请等待，若长时间无响应，请重新登录或联系管理员处理'})
        }
      }
    });
  }
  /*保存工程*/
  saveProjects(){
    const { dispatch } = this.props;
    dispatch({
      type: 'autoLogin/saveProjects',
      payload:this.projects,
      callback:(res)=>{
        if(!!res){
          console.log('工程已创建，正在创建绑定塔机...');
          if(this.projects.list.length){
            this.projects.list.forEach((item,index)=>{
              this.getCranes(item.foreignProjectId,index,this.projects.list.length);
            });
          }else{
            console.log('没有塔机需要绑定，正在登首页...');
            setTimeout(()=>{
              this.getUserInfo();
            },1000)
          }
        }else{
          this.setState({requestInfo:'当前用户数据正在同步，请等待，若长时间无响应，请重新登录或联系管理员处理'})
        }
      }
    });
  }
  /*查询塔机*/
  getCranes(projectId,index,total){
    const { dispatch } = this.props;
    const projectCranes = {foreignProjectId:projectId,list:[]};
    dispatch({
      type: 'autoLogin/getCranes',
      payload:{buildId:projectId},
      callback:(res)=>{
        if(!!res){
          res.craneList.forEach((item)=>{
            projectCranes.list.push({foreignCraneId:item.craneId,foreignCraneNumber:item.craneNumber});
          });
          this.cranes.push(projectCranes);
          if((index + 1) === total) this.saveCranes();
        }else{
          this.setState({requestInfo:'当前用户数据正在同步，请等待，若长时间无响应，请重新登录或联系管理员处理'})
        }
      }
    });
  }
  /*保存塔机*/
  saveCranes(){
    const { dispatch } = this.props;
    dispatch({
      type: 'autoLogin/saveCranes',
      payload:this.cranes,
      callback:(res)=>{
        if(!!res){
          console.log('塔机绑定完毕，正在登陆首页...');
          this.getUserInfo();
        }
      }
    });
  }
  getUserInfo(){
    router.push({pathname:'/'})
  }
  render() {
    const {requestInfo} = this.state;
    return (
      <Row className={styles.autoLogin}>
        <Col className={styles.info}>
          {requestInfo}
        </Col>
      </Row>
    );
  }
}

export default AutoLogin;
