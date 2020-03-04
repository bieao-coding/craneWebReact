/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { connect } from 'dva';
import {Row,Col,Table,Tag} from 'antd';
import {translateDecare,cutPoint,showAlarmInfo} from '@/utils/utils'
import * as PIXI from 'pixi.js'
import Animation from '../common/animation';
import styles from './craneSpread.less';
import north from './../../../../assets/images/north.png'
@connect(({ }) => ({

}))
class CraneSpread extends Component {
  state = {
    clickCrane:{}
  };
  isFirst = true;
  pixi = null;
  projectId = null;
  containerHeight = 0;
  containerWidth = 0;
  cranes = [];
  data = [];
  coordinate = [];
  loopTimer = null;
  index = 0;
  style = {
    fontFamily: 'Arial',
    fontSize: 7,
    fill: ['#cfb53b'], // gradient
    stroke:'#141e27',
    strokeThickness: 4,
    wordWrap: true,
    wordWrapWidth: 440
  };
  north = null;
  Sprite = PIXI.Sprite;
  loader = PIXI.loader;
  height = 0;
  /*DOM加载完成后执行*/
  componentDidMount() {
    const height = window.innerHeight - 50 - 20 - 40 - 38 - 60 - 2;
    this.height = height > 600 ? height : 600;
    const location = this.props.location.state;
    if(location && location.projectId){
      this.projectId = location.projectId;
      this.initCraneSpread();
      this.getConfig();
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(nextState && nextState.projectId !== currentState.projectId){
      this.refreshCanvas();
      this.addNorth();
      this.projectId = nextState.projectId;
      this.getConfig();
    }
  }
  /*刷新画布*/
  refreshCanvas() {
    if(this.loopTimer)  clearInterval(this.loopTimer);
    this.pixi.renderer.clear();
    this.pixi.stage.removeChildren();
    this.pixi.ticker.stop();
  }
  /*初始化塔机分布*/
  initCraneSpread = () => {
    const ele = document.getElementById('container');
    const pixi = new PIXI.Application({
      width: ele.offsetWidth,
      height: this.height,
      antialias: true,
      transparent: true
    });
    pixi.interactive = true;
    ele.appendChild(pixi.view);
    this.pixi = pixi;
    this.addNorth();
    this.containerHeight = this.height;
    this.containerWidth = ele.offsetWidth;
  };
  /*请求配置信息*/
  getConfig = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getConfig',
      payload:this.projectId,
      callback:(res)=>{
        const initOk = [];
        const noInit = [];
        res.list.forEach((item)=>{
          if(item.initStatus){
            initOk.push(item);
          }else{
            noInit.push(item)
          }
        });
        this.noInitCrane(noInit);
        this.data = initOk;
        this.isFirst = true;
        if(initOk.length) this.getRunData();
        else this.setState({clickCrane:{}});
      }
    });
  };
  /*未初始化*/
  noInitCrane(data){
    let lastWidth = 0;
    let lastX = this.containerWidth;
    if(data.length) data.unshift({craneNumber:'未初始化塔机：'});
    data.reverse();
    data.forEach((item,index)=>{
      const richText = new PIXI.Text((index !== data.length - 1 && index) ? item.craneNumber + '、' : item.craneNumber, this.style);
      lastWidth = richText.width;
      richText.x = lastX - lastWidth;
      lastX = richText.x;
      richText.y = 10;
      this.pixi.stage.addChild(richText);
    });
  }
  /*添加指北针*/
  addNorth(){
    if(!PIXI.utils.TextureCache.north){
      this.loader.add('north',north).load(()=>this.setUp());
    }else{
      this.setUp();
    }
  }
  setUp(){
    this.north = new this.Sprite(this.loader.resources.north.texture);
    this.north.position.set(10,10);
    this.pixi.stage.addChild(this.north);
  }
  /*获取实时数据*/
  getRunData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getRunData',
      payload:this.projectId,
      callback:(res)=>{
        let newData = this.data.map((item)=>{
          res.forEach((a)=>{
            if(item.craneId === a.craneId){
              Object.assign(item,a);
            }
          });
          return item;
        });
        this.data = newData;
        if(this.data.length) this.setState({clickCrane:this.data[this.index]});
        this.calculate();
        if(this.isFirst){
          this.timerRequest();
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
  /*将笛卡尔坐标转化为canvas的坐标*/
  calculate = () => {
    let maxX = Number.MIN_VALUE;
    let maxY=  Number.MIN_VALUE;
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    const newData = this.data.map((item)=>{
      const newValue = translateDecare(item.x,-item.y,item.a,item.b,item.rotationAngle);
      return {...item,...{x:newValue[0],y:newValue[1],rotationAngle:newValue[2]}}
    });
    for(const item of newData){
      if(item.x + item.armLength > maxX ){
        maxX = item.x + item.armLength;
      }
      if(item.x - item.armLength < minX){
        minX = item.x - item.armLength;
      }
      if(item.y + item.armLength > maxY){
        maxY = item.y + item.armLength
      }
      if(item.y - item.armLength < minY){
        minY = item.y - item.armLength;
      }
    }
    const width = maxX - minX;
    const height = maxY - minY;
    const ruleX = this.containerWidth/width;
    const ruleY = this.containerHeight/height;

    let scaleMin = ruleX < ruleY ? ruleX:ruleY;
    scaleMin = cutPoint(scaleMin,1);
    let coordinate = [];
    newData.forEach((item)=>{
      const x = (item.x - minX) * scaleMin;
      const y = (maxY - item.y) * scaleMin;
      const arm = item.armLength * scaleMin;
      const balanceArm = item.balanceArmLength * scaleMin;
      const radius = !item.radius ? 0 : cutPoint(item.radius * scaleMin,4);
      const rotation = item.rotationAngle;
      const craneType = item.craneType;
      const name = item.craneNumber;
      const color = '0x00ff99';
      coordinate.push({craneId:item.craneId,x:x,y:y,arm:arm,balanceArm:balanceArm,loader:this.loader,radius:radius,rotation:rotation,craneType:craneType,name:name,color:color});
    });
    this.coordinate = this.resolveCanvas(coordinate,width,height,scaleMin);
    if(this.isFirst){
      this.initCrane();
      this.loopUpdate();
      this.initAnimate();
    }else{
      this.loopUpdate();
    }
  };
  /*画布居中*/
  resolveCanvas(data,width,height,scale){
    const canvasCenterWidth = this.containerWidth/2;
    const canvasCenterHeight = this.containerHeight/2;
    const factCenterWidth = (width * scale)/2;
    const factCenterHeight = (height * scale)/2;
    return data.map((item)=>{
      const diffX = canvasCenterWidth + (item.x - factCenterWidth);
      const diffY = canvasCenterHeight + (item.y - factCenterHeight);
      return {...item,...{x:diffX,y:diffY}};
    });
  }
  /*循环画图*/
  initCrane(){
    this.cranes = [];
    this.coordinate.forEach((item)=>{
      const crane = new Animation();
      crane.draw({...item,...{app:this.pixi}});
      this.registerEven(crane);
      this.cranes.push(crane);
    })
  }
  /*循环更新*/
  loopUpdate(){
    this.coordinate.forEach((item,index)=>{
      this.cranes[index].update(item);
    })
  }
  /*循环动画*/
  initAnimate(){
    this.coordinate.forEach((item,index)=>{
      this.cranes[index].animate();
    })
  }
  /*为每一个塔吊注册点击事件*/
  registerEven(item){
    const self = this;
    const itemSelf = item;
    itemSelf.crane.on('pointertap',function(){
      const crane = this;
      self.data.forEach((item,index)=>{
        if(crane.name === item.craneNumber){
          self.index = index;
          self.setState({clickCrane:self.data[index]})
        }
      })
    });
  }
  /*卸载*/
  componentWillUnmount(){
    if(this.loopTimer)  clearInterval(this.loopTimer);
    this.pixi.ticker.stop();
  };
  render() {
    const {craneNumber,sn,recordTime,x = 0,y = 0,craneType = 0,height = 0,rotationAngle = 0,radius = 0,armLength = 0,balanceArmLength = 0,warning = 0,alarm = 0,peccancy = 0} = this.state.clickCrane;
    let title = '报警信息',content = [],empty = '暂无报警';
    const result = showAlarmInfo({warning:warning,alarm:alarm,peccancy:peccancy});
    if(result.warning.length){
      content.push(<div className={styles.warning}>{result.warning.join()}</div>);
    }
    if(result.alarm.length){
      content.push(<div className={styles.alarm}>{result.alarm.join()}</div>);
    }
    if(result.peccancy.length){
      content.push(<div className={styles.peccancy}>{result.peccancy.join()}</div>);
    }
    return (
      <Row type='flex' className='viewBg-color'>
        <Col xxl={18} xl={16} xs={24} id = 'container'/>
        <Col xxl={6} xl={8} xs={0} className={styles.craneInfo}>
          <Row>
            <Row className={styles.title}>塔机详参</Row>
            <Row className={styles.content}><Col span={12}>塔机编号</Col><Col span={12}>{craneNumber}</Col></Row>
            <Row className={styles.content}><Col span={12}>设备编号</Col><Col span={12}>{sn}</Col></Row>
            <Row className={styles.content}><Col span={12}>记录时间</Col><Col span={12}>{recordTime}</Col></Row>
            <Row className={styles.content}><Col span={12}>坐标X</Col><Col span={12}>{Math.floor(x * 100)/100}</Col></Row>
            <Row className={styles.content}><Col span={12}>坐标Y</Col><Col span={12}>{Math.floor(y * 100)/100}</Col></Row>
            <Row className={styles.content}><Col span={12}>塔机类型</Col><Col span={12}>{!craneType ? '平臂' : craneType === 1 ? '动臂' : '塔头'}</Col></Row>
            <Row className={styles.content}><Col span={12}>回转角度（°）</Col><Col span={12}>{Math.floor(rotationAngle * 100)/100}</Col></Row>
            <Row className={styles.content}><Col span={12}>幅度（m）</Col><Col span={12}>{Math.floor(radius * 100)/100}</Col></Row>
            <Row className={styles.content}><Col span={12}>高度（m）</Col><Col span={12}>{Math.floor(height * 100)/100}</Col></Row>
            <Row className={styles.content}><Col span={12}>起重臂（m）</Col><Col span={12}>{armLength}</Col></Row>
            <Row className={styles.content}><Col span={12}>平衡臂（m）</Col><Col span={12}>{balanceArmLength}</Col></Row>
            <Row className={styles.content}><Col span={12}>{title}</Col><Col span={12}>{content.length ? content : empty}</Col></Row>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default CraneSpread;
