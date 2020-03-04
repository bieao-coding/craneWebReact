/*eslint-disable*/
import React, { Component } from 'react';
import { connect } from 'dva';
import {Row,Col,Select,Badge } from 'antd';
import styles from './craneSideView.less';
import {cutPoint,showAlarmInfo} from '@/utils/utils'
import { formatMessage, FormattedMessage } from 'umi/locale';
import * as PIXI from 'pixi.js'
import Animation from "../common/animation";
import PingSideView from "../common/pingSideView";
import DongSideView from "../common/dongSideView";
import $ from 'jquery';
const Option = Select.Option;
@connect(({treeAllSelect }) => ({
  defaultCraneId:treeAllSelect.defaultCraneId,
}))
class CraneSideView extends Component {
  state = {
    projectId:null,
    cranes:[],
    craneId:null,
    currentData:{}
  };
  /*侧视图*/
  ping = null;
  dong = null;
  sideView = null;
  loader = PIXI.Loader.shared;
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
  colorValue = ['normal','warning','alarm','peccancy'];
  /*DOM加载完成后执行*/
  componentDidMount() {
    const height = window.innerHeight - 50 - 20 - 40 - 38 - 60 - 2;
    this.setState({height:height > 500 ? height : 500})
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
    const defaultCraneId = this.props.defaultCraneId;
    dispatch({
      type: 'monitor/getCranes',
      payload:{queryType:1,projectId:projectId},
      callback:(res)=>{
        const cranes = res.list;
        if(!cranes.length){
          this.setState({cranes:[],craneId:null});
          this.refreshCanvas();
          return;
        }
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
  /*请求配置信息*/
  getConfig = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getSignalCrane',
      payload:this.state.craneId,
      callback:(res)=>{
        this.craneData = res;
        let areaArray = [],areaAttribute = [];
        const areaVoList = res.areaList;
        areaVoList.forEach((area)=>{
          const preArea = [];
          const pointVoList = area.pointVoList;
          areaAttribute.push(area.inOrOut);
          pointVoList.forEach((pre)=>{
            preArea.push({x:pre.x,y:pre.y});
          });
          areaArray.push(preArea);
        });
        this.overlookData = {...res,...{area:areaArray,areaAttribute}};
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
      payload:this.state.craneId,
      callback:(res)=>{
        delete res.sn;
        this.craneData = {...this.craneData,...res[0]};
        this.overlookData = {...this.overlookData,...res[0]};
        this.setState({currentData:{...this.state.currentData,...res[0]}},()=>{
          this.transformType()
        });
        if(this.isFirst){
          // 侧视图
          if(this.craneData.craneType === 1) this.initDongSideView();
          else this.initPingSideView();
          this.timerRequest();
          // 俯视图
          this.initOverlook();
          this.calculateScale();
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
    if(currentData.warning){
      antiState = currentData.warning & 0x0F ? 1 : 0;
      areaState = currentData.warning & 0xF0 ? 1 : 0;
      limitState = currentData.warning & 0x3F00 ? 1 : 0;
      workState = currentData.warning & 0xC000 ? 1 : 0;
      windowState = currentData.warning & 0x10000 ? 1 : 0;
    }
    if(currentData.alarm){
      antiState = currentData.alarm & 0x0F ? 2 : antiState;
      areaState = currentData.alarm & 0xF0 ? 2 : areaState;
      limitState = currentData.alarm & 0x3F00 ? 2 : limitState;
      workState = currentData.alarm & 0xC000 ? 2 : workState;
      windowState = currentData.alarm & 0x10000 ? 2 : windowState;
    }
    if(currentData.peccancy){
      antiState = currentData.peccancy & 0x0F ? 3 : antiState;
      areaState = currentData.peccancy & 0xF0 ? 3 : areaState;
      limitState = currentData.peccancy & 0x3F00 ? 3 : limitState;
      workState = currentData.peccancy & 0xC000 ? 3 : workState;
      windowState = currentData.peccancy & 0x10000 ? 3 : windowState;
    }
    sensorState = currentData.inputState & 0x0F ? 3 : 0;
    Object.assign(currentData,{antiState:antiState,
      areaState:areaState,limitState:limitState,workState:workState,windowState:windowState,sensorState:sensorState})
    this.setState({currentData:currentData});
  }
  /*塔机侧视图*/
  initPingSideView(){
    const canvasWidth = 1028;
    const canvasHeight = 748;
    const ele = document.getElementById('sideView');
    this.scale = Math.round(((ele.offsetHeight)/ canvasHeight) * 1000) / 1000;
    this.sideView = new PIXI.Application({
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
    this.sideView = new PIXI.Application({
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
  /*计算比例尺*/
  calculateScale(){
    const width = this.overlookData.armLength * 2;
    const height = this.overlookData.armLength * 2;
    const ruleX = this.overlookWidth/width;
    const ruleY = this.overlookHeight/height;
    let scaleMin = ruleX < ruleY ? ruleX:ruleY;
    this.scale = cutPoint(scaleMin,1);
  }
  /*将笛卡尔坐标转化为canvas的坐标*/
  calculate = () => {
    this.coordinate = [];
    const x = this.overlookWidth/2;
    const y = this.overlookHeight/2;
    const diffX = x - this.overlookData.screenX * this.scale;
    const diffY = y - this.overlookData.screenY * this.scale;
    const area = this.overlookData.area.map((area)=>{
      return area.map((pre)=>{
        return {x:(pre.x * this.scale + diffX),y:(pre.y * this.scale + diffY)}
      })
    });
    const arm = this.overlookData.armLength * this.scale;
    const balanceArm = this.overlookData.balanceArmLength * this.scale;
    const radius = this.overlookData.radius * this.scale;
    const rotation = this.overlookData.screenAngle;
    const craneType = this.overlookData.craneType;
    const name = this.overlookData.craneNumber;
    const isOnline = this.overlookData.isOnline;
    const areaAttribute = this.overlookData.areaAttribute;
    const alarmResult = showAlarmInfo({warning:this.overlookData.warning,alarm:this.overlookData.alarm,peccancy:this.overlookData.peccancy,isFilter:1,hasIndex:1});
    this.coordinate.push({
      craneId:this.overlookData.craneId,
      x:x,
      y:y,
      area:area,
      areaAttribute,
      arm:arm,
      balanceArm:balanceArm,
      radius:radius,
      rotation:rotation,
      craneType:craneType,
      name:name,
      alarmResult:alarmResult,
      isOnline:isOnline
    });
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
  /*改变*/
  handleChange = (value) => {
    this.setState({craneId:value},()=>{
      this.refreshCanvas();
      this.getConfig();
    })
    this.props.dispatch({
      type: 'treeAllSelect/modifySelect',
      payload: {defaultCraneId:value}
    });
  };
  /*刷新画布*/
  refreshCanvas(){
    $('#sideView').empty();
    $('#overlook').empty();
    if(this.sideView) this.sideView.ticker.stop();
    if(this.overlook) this.overlook.ticker.stop();
    if(this.loopTimer)  clearInterval(this.loopTimer);
  }

  /*卸载*/
  componentWillUnmount(){
    this.refreshCanvas();
  };
  render() {
    const {cranes,craneId,currentData} = this.state;
    const {radius=0,height=0,loadValue=0,safeLoad = 0,stringFactor = 0,inputState = 0,rotationAngle=0,elevationAngle=0,windSpeed=0,torquePercent=0} = currentData;
    const newInputState = inputState & 40;
    return (
      <Row gutter={5} className={styles.sideView} style={{height:this.state.height}}>
        <Col xxl={18} xl={15} className={styles.animationSection}>
          <Col className={styles.craneSelect}>
            <Select onChange={this.handleChange} value = {craneId}  style={{ width: 80 }}>{cranes}</Select>
          </Col>
          <div className={styles.time}>
            {currentData.recordTime}
          </div>
          <Col className={styles.animation}>
            <Col id="sideView"/>
            <Col className={styles.lastItem}>
              <div>
              <span><FormattedMessage id='app.monitor.crane-high'/>：{currentData.towerHeight}<FormattedMessage id='app.monitor.cm'/></span>
              </div>
              <div className='m-b-10'>
              <span><FormattedMessage id='app.monitor.armLength'/>：{currentData.armLength}<FormattedMessage id='app.monitor.cm'/></span>
              </div>
              <div>
                <span><FormattedMessage id='app.monitor.crane-name'/>：{currentData.craneNumber}</span>
              </div>
              <div>
                <span><FormattedMessage id='app.monitor.crane-sn'/>：{currentData.sn}</span>
              </div>
              <div>
                <span><FormattedMessage id='app.monitor.factory'/>：{currentData.craneFactoryName}</span>
              </div>
              <div>
                <span><FormattedMessage id='app.monitor.model'/>：{currentData.craneModelName}</span>
              </div>
              <div>
                <span><FormattedMessage id='app.monitor.propertyCompanyName'/>：{currentData.propertyCompanyName}</span>
              </div>
            </Col>
          </Col>
        </Col>
        <Col xxl={3} xl={4} className={styles.paramsSection}>
          <Row className={styles.item}>
            <Col span={6} className={styles.itemFirst}>
              <i className = {['iconfont','icon-radius'].join(' ')}/>
            </Col>
            <Col span={18} className={styles.itemSecond}>
              <div><FormattedMessage id='app.monitor.radius'/></div>
              <div>{radius.toFixed(1)}<span>m</span></div>
            </Col>
          </Row>
          <Row className={styles.item}>
            <Col span={6} className={styles.itemFirst}>
              <i className = {['iconfont','icon-height'].join(' ')}/>
            </Col>
            <Col span={18} className={styles.itemSecond}>
              <div><FormattedMessage id='app.monitor.height'/></div>
              <div>{height.toFixed(1)} <span>m</span></div>
            </Col>
          </Row>
          <Row className={styles.item}>
            <Col span={6} className={styles.itemFirst}>
              <i className = {['iconfont','icon-rotation'].join(' ')}/>
            </Col>
            <Col span={18} className={styles.itemSecond}>
              <div><FormattedMessage id='app.monitor.rotationAngle'/></div>
              <div>{rotationAngle.toFixed(1)}<span>°</span></div>
            </Col>
          </Row>
          <Row className={styles.item}>
            <Col span={6} className={styles.itemFirst}>
              <i className = {['iconfont','icon-elevation'].join(' ')}/>
            </Col>
            <Col span={18} className={styles.itemSecond}>
              <div><FormattedMessage id='app.monitor.elevationAngle'/></div>
              <div>{elevationAngle.toFixed(1)}<span>°</span></div>
            </Col>
          </Row>
          <Row className={styles.item}>
            <Col span={6} className={styles.itemFirst}>
              <i className = {['iconfont','icon-work'].join(' ')}/>
            </Col>
            <Col span={18} className={styles.itemSecond}>
              <div><FormattedMessage id='app.monitor.loadValue'/></div>
              <div>{loadValue.toFixed(3)} <span>t</span></div>
            </Col>
          </Row>
          <Row className={styles.item}>
            <Col span={6} className={styles.itemFirst}>
              <i className = {['iconfont','icon-safeLoad'].join(' ')}/>
            </Col>
            <Col span={18} className={styles.itemSecond}>
              <div><FormattedMessage id='app.monitor.safeLoad'/></div>
              <div>{safeLoad.toFixed(1)} <span>t</span></div>
            </Col>
          </Row>
          <Row className={styles.item}>
            <Col span={6} className={styles.itemFirst}>
              <i className = {['iconfont','icon-window'].join(' ')}/>
            </Col>
            <Col span={18} className={styles.itemSecond}>
              <div><FormattedMessage id='app.monitor.windSpeed'/></div>
              <div>{windSpeed.toFixed(1)} <span>m/s</span></div>
            </Col>
          </Row>
          <Row className={styles.item}>
            <Col span={6} className={styles.itemFirst}>
              <i className = {['iconfont','icon-torque'].join(' ')}/>
            </Col>
            <Col span={18} className={styles.itemSecond}>
              <div><FormattedMessage id='app.monitor.torquePercent'/></div>
              <div>{torquePercent.toFixed(1)} <span>%</span></div>
            </Col>
          </Row>
          <Row className={styles.item}>
            <Col span={6} className={styles.itemFirst}>
              <i className = {['iconfont','icon-beiLv'].join(' ')}/>
            </Col>
            <Col span={18} className={styles.itemSecond}>
              <div><FormattedMessage id='app.monitor.stringFactor'/></div>
              <div>{stringFactor}<span>F</span></div>
            </Col>
          </Row>
        </Col>
        <Col xxl={3} xl={5} className={styles.sideViewSection} >
          <div id='overlook'/>
          <div>
            <div><div className={styles[this.colorValue[currentData.limitState]]}></div><FormattedMessage id='app.common.limit'/></div>
            <div><div className={styles[this.colorValue[currentData.workState]]}></div><FormattedMessage id='app.common.overLoad'/></div>
            <div><div className={styles[this.colorValue[currentData.windowState]]}></div><FormattedMessage id='app.common.windSpeed'/></div>
            <div><div className={styles[this.colorValue[currentData.antiState]]}></div><FormattedMessage id='app.common.collision'/></div>
            <div><div className={styles[this.colorValue[currentData.areaState]]}></div><FormattedMessage id='app.common.area'/></div>
            <div><div className={styles[this.colorValue[currentData.sensorState]]}></div><FormattedMessage id='app.monitor.error'/></div>
          </div>
        </Col>
      </Row>
    );
  }
}

export default CraneSideView;
