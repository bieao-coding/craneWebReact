/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import styles from './videoLive.less';
import linLogo from '../../../../assets/linLogo.png';
import logo from '../../../../assets/logo.png';
import info from '@/defaultInfo';
import {Form,Card,Row,Col,Button,Input,DatePicker,Select,message} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
const Option = Select.Option;
@connect(({ monitor,treeAllSelect }) => ({
  monitor,
  defaultCraneId:treeAllSelect.defaultCraneId,
}))
class VideoLive extends Component {
  state = {
    mainHookLoading:false,
    jibLoading:false,
    cabinLoading:false,
    balanceLoading:false,
    nvrInfo:null,
    channel:null,
    cranes:[],
    craneId:null,
    pullAddress:null,
  };
  currentInfo = null;
  /*DOM加载完成后执行*/
  componentDidMount() {
    const height = window.innerHeight - 50 - 20 - 40 - 38 - 60 - 2;
    this.height = height > 400 ? height : 400;
    const location = this.props.location.state;
    if(location && location.projectId){
      this.setState({projectId:location.projectId},()=>{
        this.getCranes(location.projectId);
      })
    }
  }
  // /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(nextState && nextState.projectId !== currentState.projectId){
      this.setState({projectId:nextState.projectId},()=>{
        this.closeLive();
        this.getCranes(nextState.projectId);
      })
    }
  }
  /*请求塔机列表*/
  getCranes(projectId){
    const { dispatch } = this.props;
    const defaultCraneId = this.props.defaultCraneId;
    dispatch({
      type: 'monitor/getCranes',
      payload:{queryType:1,projectId:projectId},
      callback:(res)=>{
        const cranes = res.list;
        if(!cranes.length){
          this.setState({cranes:[],craneId:null,});
          return;
        };
        const newCranes = cranes.map((item) => {
          return <Option value={item.craneId} key={item.craneId}>{item.craneNumber}</Option>
        });
        this.setState({cranes: newCranes},()=>{
          let selectId = null;
          if(defaultCraneId && cranes.some((item)=>item.craneId === defaultCraneId)){
            selectId = defaultCraneId
          }else{
            selectId = cranes[0].craneId;
          }
          this.setState({craneId:selectId},()=>{
            this.handleChange(this.state.craneId);
          })
          this.props.dispatch({
            type: 'treeAllSelect/modifySelect',
            payload: {defaultCraneId:selectId}
          });
        });
      }
    });
  }
  handleChange = (value) => {
    this.closeLive();
    this.currentInfo = null;
    this.setState({channel:null,mainHookLoading:false,jibLoading:false,cabinLoading:false,balanceLoading:false});
    this.setState({craneId:value},()=>{
      this.getNvrInfo(value);
    })
    this.props.dispatch({
      type: 'treeAllSelect/modifySelect',
      payload: {defaultCraneId:value}
    });
  };
  /*获取NVR信息*/
  getNvrInfo(craneId){
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getNvrInfo',
      payload:craneId,
      callback:(res)=>{
        if(!!res){
          this.setState({nvrInfo:res})
        }else{
          message.error(formatMessage({id:'app.monitor.no-nvr'}));
        }
      }
    });
  }
  /*获取地址*/
  live(){
    const {address} = this.currentInfo;
    const width = $(`#channel`).width();
    const height = $(`#channel`).height();
    const html = (<video id='myPlayer' controls={true} autoPlay={true} width={width} height={height} data-setup='{}'>
      <source src={address} type="application/x-mpegURL"/>
    </video>);
    this.setState({channel:html},()=>{
      const player = new EZUIPlayer(`myPlayer`);
      this.currentInfo.player = player;
      this.setState({mainHookLoading:false,jibLoading:false,cabinLoading:false,balanceLoading:false});
    });
  }
  /*关闭直播*/
  closeLive(){
    /*关闭取流*/
    if(!!this.currentInfo){
      const {player} = this.currentInfo;
      if(!!player){
        player.stop();
      }
    }
  }
  play = (type) => {
    this.closeLive();
    let liveUrl = null,mainHookLoading = false,jibLoading = false,cabinLoading = false,balanceLoading = false;
    const {nvrInfo} = this.state;
    if(!nvrInfo) return;
    this.currentInfo = null;
    this.setState({channel:null,mainHookLoading:false,jibLoading:false,cabinLoading:false,balanceLoading:false},()=>{
      switch(type){
        case 1:
          liveUrl = nvrInfo.mainHookAddr;
          mainHookLoading = true;
          break;
        case 2:
          liveUrl = nvrInfo.jibAddr;
          jibLoading = true;
          break;
        case 3:
          liveUrl = nvrInfo.balanceAddr;
          balanceLoading = true;
          break;
        case 4:
          liveUrl = nvrInfo.cabinAddr;
          cabinLoading = true;
          break;
      };
      if(!liveUrl){
        message.error(formatMessage({id:'app.monitor.get-address'}));
      }else{
        this.setState({mainHookLoading:mainHookLoading,jibLoading:jibLoading,cabinLoading:cabinLoading,balanceLoading:balanceLoading})
        this.currentInfo = {address:liveUrl};
        this.live();
      }
    });
  };
  /*销毁组件*/
  componentWillUnmount(){
    this.closeLive();
  }
  render() {
    const {mainHookLoading,cabinLoading,jibLoading,balanceLoading,craneId,cranes,channel} = this.state;
    return (
      <div className={styles.live}>
        <div className={styles.buttons}>
          <Select className='m-r-10' onChange={this.handleChange} value = {craneId}  style={{ width: 80 }}>{cranes}</Select>
          <Button className='m-r-10' type="primary" disabled={!craneId} icon="video-camera" loading={mainHookLoading} onClick={()=>this.play(1)}><FormattedMessage id='app.monitor.main' /></Button>
          <Button className='m-r-10' type="primary" disabled={!craneId} icon="video-camera" loading={jibLoading} onClick={()=>this.play(2)}><FormattedMessage id='app.monitor.radiusJuan' /></Button>
          <Button className='m-r-10' type="primary" disabled={!craneId} icon="video-camera" loading={balanceLoading} onClick={()=>this.play(3)}><FormattedMessage id='app.monitor.upJuan' /></Button>
          <Button type="primary" icon="video-camera" disabled={!craneId} loading={cabinLoading} onClick={()=>this.play(4)}><FormattedMessage id='app.monitor.cabin' /></Button>
        </div>
        <div className={styles.channel} style={{height:this.height}} id='channel'>
          {channel ? channel : <img src={info.isLin ? linLogo : logo} />}
        </div>
      </div>
    );
  }
}

export default VideoLive;
