/*eslint-disable*/
import React, { Component } from 'react';
import { connect } from 'dva';
import {Row,Col,Select,Badge } from 'antd';
import CardView from '../common/cardView';
import styles from './craneSideViewTwo.less';
import {translateDecare} from '@/utils/utils'
import * as PIXI from 'pixi.js'
import Animation from "../common/animation";
import PingSideView from "../common/pingSideView";
import DongSideView from "../common/dongSideView";
import info from '@/defaultInfo';
import $ from 'jquery';
const Option = Select.Option;
@connect(({ }) => ({

}))
class CraneSideViewTwo extends Component {
  state = {
    cranes:[],
    craneId:null,
    currentData:{}
  };
  /*侧视图*/
  ping = null;
  dong = null;
  sideView = null;
  Application = PIXI.Application;
  loader = PIXI.loader;
  craneData = null;//塔机的信息
  scale = 1;
  isFirst = true;
  loopTimer = null;
  /*俯视图*/
  overlook = null;
  overlookHeight = 0;
  overlookWidth = 0;
  coordinate = [];
  overlookCrane = [];
  overlookData = null;
  /*DOM加载完成后执行*/
  componentDidMount() {
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
        this.getCranes(nextState.projectId);
      })
    }
  }
  /*请求塔机列表*/
  getCranes(projectId){
    const { dispatch } = this.props;
    const defaultCraneId = info.defaultCraneId;
    dispatch({
      type: 'monitor/getCranes',
      payload:{queryType:1,projectId:projectId},
      callback:(res)=>{
        const cranes = res.list;
        if(!cranes.length) return;
        const newCranes = cranes.map((item) => {
          return <Option value={item.craneId} key={item.craneId}>{item.craneNumber}</Option>
        });
        this.setState({cranes: newCranes},()=>{
          let selectId = null;
          if(defaultCraneId && cranes.some((item)=>item.craneId === defaultCraneId)){
            selectId = defaultCraneId
          }else{
            selectId = cranes[0].craneId;
            info.defaultCraneId = selectId;
          }
          this.setState({craneId:selectId},()=>{
            this.handleChange(this.state.craneId);
          })
        });
      }
    });
  }
  /*请求配置信息*/
  getConfig = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getSignalCrane',
      payload:this.state.craneId,
      callback:(res)=>{
        this.craneData = res;
        this.overlookData = res;
        this.setState({currentData:res});
        this.isFirst = true;
        this.getRunData();
      }
    });
  };
  /*获取实时数据*/
  getRunData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getSignalRunData',
      payload:{craneId:this.state.craneId},
      callback:(res)=>{
        delete res.sn;
        this.craneData = {...this.craneData,...res};
        this.overlookData = {...this.overlookData,...res};
        this.setState({currentData:{...this.state.currentData,...res}},()=>{
          this.transformType()
        });
        if(this.isFirst){
          // 侧视图
          if(this.craneData.craneType === 1) this.initDongSideView();
          else this.initPingSideView();
          this.timerRequest();
          // 俯视图
          this.initOverlook();
          this.calculate();
          this.initCrane();
          this.loopUpdate();
          this.initAnimate();
        }else{
          if(this.craneData.craneType === 1) this.dong.update(this.craneData);
          else this.ping.update(this.craneData);
          this.calculate();
          this.loopUpdate();
        }
      }
    });
  };

  /*定时请求*/
  timerRequest = () => {
    this.loopTimer = setInterval(()=>{
      this.isFirst = false;
      this.getRunData();
    },2000);
  };

  /*处理报警类型*/
  transformType(){
    //先处理违章
    const {currentData} = this.state;
    let antiState = 0; //防碰撞状态
    let areaState = 0; //区域状态
    let limitState = 0; //限位状态
    let workState = 0; //超重状态
    let windowState = 0; //风速状态
    let sensorState = 0; //传感器状态
    let qingState = 0; //倾斜状态
    let obstacleState = 0; //障碍物状态
    if(currentData.peccancy){
      antiState = currentData.peccancy & 0x0F ? 3 : 0;
      areaState = currentData.peccancy & 0xF0 ? 3 : 0;
      limitState = currentData.peccancy & 0x3F00 ? 3 : 0;
      workState = currentData.peccancy & 0xDF00 ? 3 : 0;
      windowState = currentData.peccancy & 0x10000 ? 3 : 0;
      sensorState = currentData.inputState & 0x3F ? 3 : 0;
    }else if(currentData.alarm){
      antiState = currentData.alarm & 0x0F ? 2 : 0;
      areaState = currentData.alarm & 0xF0 ? 2 : 0;
      limitState = currentData.alarm & 0x3F00 ? 2 : 0;
      workState = currentData.alarm & 0xDF00 ? 2 : 0;
      windowState = currentData.alarm & 0x10000 ? 2 : 0;
      sensorState = currentData.alarm & 0x3F ? 2 : 0;
    }else if(currentData.warning){
      antiState = currentData.warning & 0x0F ? 1 : 0;
      areaState = currentData.warning & 0xF0 ? 1 : 0;
      limitState = currentData.warning & 0x3F00 ? 1 : 0;
      workState = currentData.warning & 0xDF00 ? 1 : 0;
      windowState = currentData.warning & 0x10000 ? 1 : 0;
      sensorState = currentData.warning & 0x3F ? 1 : 0;
    }
    Object.assign(currentData,{antiState:antiState,
      areaState:areaState,limitState:limitState,workState:workState,windowState:windowState,sensorState:sensorState,qingState:qingState,obstacleState:obstacleState})
    this.setState({currentData:currentData});
  }
  /*塔机侧视图*/
  initPingSideView(){
    const canvasWidth = 1028;
    const canvasHeight = 748;
    const ele = document.getElementById('sideView');
    this.scale = Math.round(((ele.offsetHeight)/ canvasHeight) * 1000) / 1000;
    this.sideView = new this.Application({
        width: canvasWidth * this.scale,
        height: canvasHeight * this.scale,
        antialias: true,
        transparent: true,
        resolution: 1
      }
    );
    ele.appendChild(this.sideView.view);
    this.ping = new PingSideView();
    this.ping.init({canvasWidth:canvasWidth,canvasHeight:canvasHeight,scale:this.scale,loader:this.loader,sideView:this.sideView,...this.craneData});
  }

  /*塔机侧视图*/
  initDongSideView(){
    const ele = document.getElementById('sideView');
    const canvasWidth = 841;
    const canvasHeight = ele.offsetHeight;
    const pictureHeight = 882;//塔机+臂垂直时的高度
    this.scale = Math.round((canvasHeight/ pictureHeight) * 1000) / 1000;
    this.sideView = new this.Application({
        width: canvasWidth * this.scale,
        height: canvasHeight,
        antialias: true,
        transparent: true,
        resolution: 1
      }
    );
    ele.appendChild(this.sideView.view);
    this.dong = new DongSideView();
    this.dong.init({scale:this.scale,loader:this.loader,sideView:this.sideView,...this.craneData});
  }

  /*初始塔机俯视图*/
  initOverlook(){
    const ele = document.getElementById('overlook');
    const pixi = new PIXI.Application({
      width: ele.offsetWidth,
      height: ele.offsetHeight,
      antialias: true,
      transparent: true
    });
    pixi.interactive = true;
    ele.appendChild(pixi.view);
    this.overlook = pixi;
    this.overlookHeight = ele.offsetHeight;
    this.overlookWidth = ele.offsetWidth;
  }
  /*将笛卡尔坐标转化为canvas的坐标*/
  calculate = () => {
    const newValue = translateDecare(this.overlookData.x,this.overlookData.y,this.overlookData.a,this.overlookData.b,this.overlookData.rotationAngle);
    Object.assign(this.overlookData,{x:newValue[0],y:newValue[1],rotationAngle:newValue[2]});
    const width = this.overlookData.armLength * 2;
    const height = this.overlookData.armLength * 2;
    const ruleX = this.overlookWidth/width;
    const ruleY = this.overlookHeight/height;

    const scaleMin = ruleX < ruleY ? ruleX:ruleY;
    this.coordinate = [];
    const x = this.overlookWidth/2;
    const y = this.overlookHeight/2;
    const arm = Math.round(this.overlookData.armLength * scaleMin - 5);
    const radius = !this.overlookData.radius ? 0 : Math.round(this.overlookData.radius * scaleMin - 5);
    const rotation = Math.round(this.overlookData.rotationAngle);
    const craneType = this.overlookData.craneType;
    const name = this.overlookData.craneNumber;
    this.coordinate.push({craneId:this.overlookData.craneId,x:x,y:y,arm:arm,radius:radius,rotation:rotation,craneType:craneType,name:name});
  };
  /*循环画图*/
  initCrane(){
    this.overlookCrane = [];
    const crane = new Animation();
    crane.draw({...this.coordinate[0],...{app:this.overlook}});
    this.overlookCrane.push(crane);
  }
  /*循环更新*/
  loopUpdate(){
    this.overlookCrane[0].update(this.coordinate[0]);
  }
  /*循环动画*/
  initAnimate(){
    this.overlookCrane[0].animate();
  }

  handleChange = (value) => {
    info.defaultCraneId = value;
    this.setState({craneId:value},()=>{
      $('#sideView').empty();
      $('#overlook').empty();
      this.refreshCanvas();
      if(this.loopTimer)  clearInterval(this.loopTimer);
      this.getConfig();
    })
  };
  /*刷新画布*/
  refreshCanvas(){
    this.loader.loading = false;
    this.loader.progress = 0;
    this.loader.resources = {};
    if(this.sideView) this.sideView.ticker.stop();
    if(this.overlook) this.overlook.ticker.stop();
  }

  /*卸载*/
  componentWillUnmount(){
    this.refreshCanvas();
    if(this.sideView) this.sideView.ticker.remove();
    if(this.loopTimer)  clearInterval(this.loopTimer);
  };
  render() {
    const {cranes,craneId,currentData} = this.state;
    const radiusProps = {title:'幅度',icon:'icon-radius',currentNum:currentData.radius,unit:'m',minNum:0,maxNum:currentData.armLength,alarmTitle:'限位',alarmDeep:currentData.limitState};
    const HeightProps = {title:'高度',icon:'icon-height',currentNum:currentData.height,unit:'m',minNum:0,maxNum:300,alarmTitle:'超重',alarmDeep:currentData.workState};
    const windowProps = {title:'风速',icon:'icon-window',currentNum:currentData.windSpeed,unit:'m/s',minNum:0,maxNum:32,alarmTitle:'风速',alarmDeep:currentData.windowState};
    const workProps = {title:'吊重',icon:'icon-work',currentNum:currentData.loadValue,unit:'t',minNum:0,maxNum:currentData.safeLoad,alarmTitle:'倾斜',alarmDeep:currentData.qingState};
    const torqueProps = {title:'力矩比',icon:'icon-torque',currentNum:currentData.torquePercent,unit:'%',minNum:0,maxNum:100,alarmTitle:'塔机间碰撞',alarmDeep:currentData.antiState};
    const heProps = {title:'荷载比',icon:'icon-he',currentNum:0,unit:'%',minNum:0,maxNum:100,alarmTitle:'障碍物碰撞',alarmDeep:currentData.obstacleState};
    const rotationProps = {title:'转角',icon:'icon-rotation',currentNum:currentData.rotationAngle,unit:'°',minNum:0,maxNum:360,alarmTitle:'进入禁行区',alarmDeep:currentData.areaState};
    const elevationProps = {title:'仰角',icon:'icon-elevation',currentNum:currentData.elevationAngle,unit:'°',minNum:0,maxNum:80,alarmTitle:'传感器故障',alarmDeep:currentData.sensorState};
    return (
      <Row className={['all-height','flex', 'flex-column', 'auto-flex',styles.sideView].join(' ')}>
          <Row type="flex" style={{height:'calc(100% - 200px)'}}>
            <Col  className={styles.topLeft}>
              <Col className={styles.firstItem}>
                <Select onChange={this.handleChange} value = {craneId}  style={{ width: 80 }}>{cranes}</Select>
              </Col>
              <Col  id="sideView" />
              <Col className={styles.lastItem}>
                <div>
                  <span>塔高：{currentData.towerHeight}米</span>
                </div>
                <div>
                  <span>前臂：{currentData.armLength}米</span>
                </div>
              </Col>
              <div className={styles.time}>
                {currentData.recordTime}
              </div>
            </Col>
            <Col className={['flex1','flex', 'flex-column',styles.topRight].join(' ')} >
              <Col className='flex2' id='overlook' />
              <Col className={styles.divider} />
              <Col className={styles.deviceInfo} >
                <span>塔机编号：{currentData.craneNumber}</span>
                <span>设备编号：{currentData.sn}</span>
                <span>生产厂商：{currentData.craneFactoryName}</span>
                <span>塔机型号：{currentData.craneModelName}</span>
                <span>产权单位：{currentData.propertyCompanyName }</span>
              </Col>
            </Col>
          </Row>
          <Row gutter={10} className={styles.paramsView}>
            <Col span={3} className='all-height flex align-end'><CardView {...radiusProps}/></Col>
            <Col span={3} className='all-height flex align-end'><CardView {...HeightProps}/></Col>
            <Col span={3} className='all-height flex align-end'><CardView {...windowProps}/></Col>
            <Col span={3} className='all-height flex align-end'><CardView {...workProps}/></Col>
            <Col span={3} className='all-height flex align-end'><CardView {...torqueProps}/></Col>
            <Col span={3} className='all-height flex align-end'><CardView {...heProps}/></Col>
            <Col span={3} className='all-height flex align-end'><CardView {...rotationProps}/></Col>
            <Col span={3} className='all-height flex  align-end'><CardView {...elevationProps}/></Col>
          </Row>
      </Row>
    );
  }
}

export default CraneSideViewTwo;
