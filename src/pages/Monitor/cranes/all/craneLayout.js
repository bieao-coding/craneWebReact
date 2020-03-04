/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {Row,Tag,Tabs} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import * as PIXI from 'pixi.js'
import north from "../../../../assets/images/north.png";
import bg from './../../../../assets/images/bg.png'
import limitWarningOut from '../../../../assets/images/limitWarningOut.png'
import limitAlarmOut from '../../../../assets/images/limitAlarmOut.png'
import antiWarningOut from '../../../../assets/images/antiWarningOut.png'
import antiAlarmOut from '../../../../assets/images/antiAlarmOut.png'
import areaWarningOut from '../../../../assets/images/areaWarningOut.png'
import areaAlarmOut from '../../../../assets/images/areaAlarmOut.png'
import limitWarningInto from '../../../../assets/images/limitWarningInto.png'
import limitAlarmInto from '../../../../assets/images/limitAlarmInto.png'
import antiWarningInto from '../../../../assets/images/antiWarningInto.png'
import antiAlarmInto from '../../../../assets/images/antiAlarmInto.png'
import areaWarningInto from '../../../../assets/images/areaWarningInto.png'
import areaAlarmInto from '../../../../assets/images/areaAlarmInto.png'

import limitWarningLeft from '../../../../assets/images/limitWarningLeft.png'
import limitAlarmLeft from '../../../../assets/images/limitAlarmLeft.png'
import antiWarningLeft from '../../../../assets/images/antiWarningLeft.png'
import antiAlarmLeft from '../../../../assets/images/antiAlarmLeft.png'
import areaWarningLeft from '../../../../assets/images/areaWarningLeft.png'
import areaAlarmLeft from '../../../../assets/images/areaAlarmLeft.png'

import limitWarningRight from '../../../../assets/images/limitWarningRight.png'
import limitAlarmRight from '../../../../assets/images/limitAlarmRight.png'
import antiWarningRight from '../../../../assets/images/antiWarningRight.png'
import antiAlarmRight from '../../../../assets/images/antiAlarmRight.png'
import areaWarningRight from '../../../../assets/images/areaWarningRight.png'
import areaAlarmRight from '../../../../assets/images/areaAlarmRight.png'

import dropWarningUp from '../../../../assets/images/dropWarningUp.png'
import dropAlarmUp from '../../../../assets/images/dropAlarmUp.png'
import dropWarningDown from '../../../../assets/images/dropWarningDown.png'
import dropAlarmDown from '../../../../assets/images/dropAlarmDown.png'

import windSpeedWarning from '../../../../assets/images/windSpeedWarning.png'
import windSpeedAlarm from '../../../../assets/images/windSpeedAlarm.png'
import torqueWarning from '../../../../assets/images/torqueWarning.png'
import torqueAlarm from '../../../../assets/images/torqueAlarm.png'
const TabPane = Tabs.TabPane;
@connect(({user}) => ({
  auth:user.authorization
}))
class CraneLayout extends Component {
  state = {
    projectId:null,
    maxWidth:null,
    activeKey:'list',
    tabs:[]
  };
  tabsUrl = {
    list:formatMessage({id:'app.monitor.craneList'}),
    config:formatMessage({id:'app.monitor.config'}),
    spread:formatMessage({id:'app.monitor.spread'}),
    history:formatMessage({id:'app.monitor.history'}),
    sideView:formatMessage({id:'app.monitor.sideView'}),
    antiRunRecord:formatMessage({id:'app.monitor.antiRunRecord'}),
    workRunRecord:formatMessage({id:'app.monitor.workRunRecord'}),
    antiRunTime:formatMessage({id:'app.monitor.antiRunTime'}),
    videoLive:formatMessage({id:'app.monitor.videoLive'})
  };
  /*DOM加载完成后执行*/
  componentDidMount() {
    this.setAuth();
    this.setState({maxWidth:document.getElementById('content').offsetWidth});
    const location = this.props.location.state;
    if(location && location.projectId){
      this.addPicture();
      this.setState({projectId:location.projectId,title:location.title},()=>{
        this.callback('list');
      })
    }
  }

  /*按钮权限*/
  setAuth(){
    const auth = this.props.auth;
    const array = [];
    for(const key in this.tabsUrl){
      const content = this.tabsUrl[key];
      if(auth[key]){
        array.push(<TabPane tab = {content} key={key}/>)
      }
    }
    this.setState({tabs:array})
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(nextState && nextState.projectId !== currentState.projectId){
      this.setState({projectId:nextState.projectId,title:nextState.title})
    }
  }

  callback = (key) => {
    const {projectId} = this.state;
    this.setState({activeKey:key});
    router.push({
      pathname:`/monitor/monitorLayout/crane/${key}`,
      state:{projectId:projectId}
    });
  };

  /*添加所需图片*/
  addPicture(){
    if(Object.keys(PIXI.Loader.shared.resources).length <= 0){
      PIXI.Loader.shared
        .add('north',north)
        .add('bg',bg)
        .add('limitWarningOut',limitWarningOut)
        .add('limitAlarmOut',limitAlarmOut)
        .add('antiWarningOut',antiWarningOut)
        .add('antiAlarmOut',antiAlarmOut)
        .add('areaWarningOut',areaWarningOut)
        .add('areaAlarmOut',areaAlarmOut)
        .add('limitWarningInto',limitWarningInto)
        .add('limitAlarmInto',limitAlarmInto)
        .add('antiWarningInto',antiWarningInto)
        .add('antiAlarmInto',antiAlarmInto)
        .add('areaWarningInto',areaWarningInto)
        .add('areaAlarmInto',areaAlarmInto)
        .add('limitWarningLeft',limitWarningLeft)
        .add('limitAlarmLeft',limitAlarmLeft)
        .add('antiWarningLeft',antiWarningLeft)
        .add('antiAlarmLeft',antiAlarmLeft)
        .add('areaWarningLeft',areaWarningLeft)
        .add('areaAlarmLeft',areaAlarmLeft)
        .add('limitWarningRight',limitWarningRight)
        .add('limitAlarmRight',limitAlarmRight)
        .add('antiWarningRight',antiWarningRight)
        .add('antiAlarmRight',antiAlarmRight)
        .add('areaWarningRight',areaWarningRight)
        .add('areaAlarmRight',areaAlarmRight)
        .add('dropWarningUp',dropWarningUp)
        .add('dropAlarmUp',dropAlarmUp)
        .add('dropWarningDown',dropWarningDown)
        .add('dropAlarmDown',dropAlarmDown)
        .add('windSpeedWarning',windSpeedWarning)
        .add('windSpeedAlarm',windSpeedAlarm)
        .add('torqueWarning',torqueWarning)
        .add('torqueAlarm',torqueAlarm)
        .load()
    }
  }

  render() {
    const {children} = this.props;
    const {title,maxWidth,activeKey,tabs} = this.state;
    return (
      <div className='p-l-10'>
        <Row className='title'>{title}</Row>
        <Row>
          {tabs.length ? (
            <Tabs onChange={this.callback} activeKey={activeKey}  style={{ width: maxWidth - 64 }}>
              {tabs}
            </Tabs>
          ) : <Fragment></Fragment>}
        </Row>
        <Row>
          {children}
        </Row>
      </div>
    );
  }
}

export default CraneLayout;
