/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { connect } from 'dva';
import {Row,Col,Table,Tag} from 'antd';
import {cutPoint,showAlarmInfo} from '@/utils/utils'
import Animation from '../common/animation';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './craneSpread.less';
import * as PIXI from 'pixi.js'
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
    fontSize: 12,
    fill: ['#cfb53b'], // gradient
    stroke:'#141e27',
    strokeThickness: 4,
    wordWrap: true,
    wordWrapWidth: 440
  };
  north = null;
  Sprite = PIXI.Sprite;
  loader = PIXI.Loader.shared;
  height = 0;
  orgData = {minBorderX:0,minBorderY:0,height:0,width:0};
  projectPicture = {};
  scale = 1;
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
      this.addPublicPicture();
      this.projectId = nextState.projectId;
      this.index = 0;
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
      transparent: true,
      resolution:1
    });
    pixi.interactive = true;
    ele.appendChild(pixi.view);
    this.pixi = pixi;
    this.addPublicPicture();
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
        this.orgData = res.screenRect;
        this.projectPicture = res.projectPicture;
        res.craneList.forEach((item)=>{
          if(item.initStatus || item.isCustom){
            let areaArray = [],areaAttribute = [];
            const areaVoList = item.areaList;
            areaVoList.forEach((area)=>{
              const preArea = [];
              const pointVoList = area.pointVoList;
              areaAttribute.push(area.inOrOut);
              pointVoList.forEach((pre)=>{
                preArea.push({x:pre.x - this.orgData.minBorderX,y:pre.y - this.orgData.minBorderY});
              });
              areaArray.push(preArea);
            })
            initOk.push({...item,...{area:areaArray,areaAttribute}});
          }else{
            noInit.push(item)
          }
        });
        this.noInitCrane(noInit);
        this.data = initOk;
        this.isFirst = true;
        this.calculateScale();
        if(initOk.length) this.getRunData();
        else this.setState({clickCrane:{}});
      }
    });
  };
  /*请求工地底图*/
  requestBottom(){
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getBottomPicture',
      payload:this.projectId,
      callback:(res)=>{
        this.projectPicture = res;
        this.addBottom();
      }
    });
  }
  /*未初始化*/
  noInitCrane(data){
    let lastWidth = 0;
    let lastX = this.containerWidth;
    if(data.length) data.unshift({craneNumber:formatMessage({id:'app.monitor.no-init-crane'})});
    data.reverse();
    data.forEach((item,index)=>{
      const richText = new PIXI.Text((index !== data.length - 1 && index) ? item.craneNumber + '、' : item.craneNumber, this.style);
      lastWidth = richText.width;
      const x = lastX - lastWidth;
      lastX = x;
      richText.position.set(x,10);
      this.pixi.stage.addChild(richText);
    });
  }
  getBase64Image(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();
    const dataURL = canvas.toDataURL("image/"+ext);
    return dataURL;
  }

  /*添加底图*/
  addBottom(){
    const {picture} = this.projectPicture;
    if(!picture) return;
    const pictureName = picture.substring(0,picture.lastIndexOf('.'));
    if(!!PIXI.Loader.shared.resources[pictureName]){
      this.bottom = new PIXI.Sprite(PIXI.Loader.shared.resources[pictureName].texture);
      this.setUp()
    }else{
      const self = this;
      const image = new Image();
      image.src = picture;
      image.onload = function(){
        const base64 = self.getBase64Image(image);
        PIXI.Loader.shared.add(pictureName,base64).load(()=>{
          self.bottom = new PIXI.Sprite(PIXI.Loader.shared.resources[pictureName].texture);
          self.setUp()
        })
      }
    }
  }
  setUp(){
    const {pictureScale,alpha,angle,screenCenterX,screenCenterY} = this.projectPicture;
    const {minBorderX,minBorderY,width,height} = this.orgData;
    this.bottom.x = (screenCenterX - minBorderX) * this.scale;
    this.bottom.y = (screenCenterY - minBorderY) * this.scale;
    const diffX = this.canvasCenterWidth + (this.bottom.x - this.factCenterWidth);
    const diffY = this.canvasCenterHeight + (this.bottom.y - this.factCenterHeight);
    this.bottom.x = diffX;
    this.bottom.y = diffY;
    this.bottom.anchor.set(0.5);
    this.bottom.scale.set((width * this.scale * pictureScale)/this.bottom.width);
    this.bottom.alpha = alpha;
    this.bottom.rotation = angle;
    this.pixi.stage.addChildAt(this.bottom,0);
    this.pixi.render(this.pixi.stage);
  }
  /*添加公共图标*/
  addPublicPicture(){
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
  /*计算比例尺*/
  calculateScale(){
    const {height,width} = this.orgData;
    const ruleX = this.containerWidth/width;
    const ruleY = this.containerHeight/height;
    let scaleMin = ruleX < ruleY ? ruleX:ruleY;
    scaleMin = cutPoint(scaleMin,1);
    this.canvasCenterWidth = this.containerWidth/2;
    this.canvasCenterHeight = this.containerHeight/2;
    this.factCenterWidth = width * scaleMin/2;
    this.factCenterHeight = height * scaleMin/2;
    this.scale = scaleMin;
    this.requestBottom();
  }
  calculate = () => {
    const {minBorderX,minBorderY} = this.orgData;
    let coordinate = [];
    this.data.forEach((item)=>{
      const x = (item.screenX - minBorderX) * this.scale;
      const y = (item.screenY - minBorderY) * this.scale;
      const area = item.area.map((area)=>{
        return area.map((pre)=>{
          return {x:pre.x * this.scale,y:pre.y * this.scale}
        })
      });
      const arm = item.armLength * this.scale;
      const balanceArm = item.balanceArmLength * this.scale;
      const radius = item.radius * this.scale;
      const rotation = item.screenAngle;
      const craneType = item.craneType;
      const name = item.craneAlias;
      const isOnline = item.isOnline;
      const areaAttribute = item.areaAttribute;
      const alarmResult = showAlarmInfo({warning:item.warning,alarm:item.alarm,peccancy:item.peccancy,isFilter:1,hasIndex:1});
      coordinate.push({
          craneId:item.craneId,
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
    });
    this.coordinate = this.resolveCanvas(coordinate);
    if(this.isFirst){
      this.initCrane();
      this.loopUpdate(1);
      this.initAnimate();
    }else{
      this.loopUpdate();
    }
  };
  /*画布居中*/
  resolveCanvas(data){
    return data.map((item)=>{
      const diffX = this.canvasCenterWidth + (item.x - this.factCenterWidth);
      const diffY = this.canvasCenterHeight + (item.y - this.factCenterHeight);
      const area = item.area.map((area)=>{
        return area.map((pre)=>{
          return {x:this.canvasCenterWidth + (pre.x - this.factCenterWidth),y:this.canvasCenterHeight + (pre.y - this.factCenterHeight)}
        })
      });
      return {...item,...{x:diffX,y:diffY,area}};
    });
  }
  /*循环画图*/
  initCrane(){
    this.cranes = [];
    this.coordinate.forEach((item)=>{
      const crane = new Animation();
      crane.draw({...item,...{app:this.pixi}});
      this.cranes.push(crane);
    })
  }
  /*循环更新*/
  loopUpdate(type){
    this.coordinate.forEach((item,index)=>{
      const oldOnline = this.cranes[index].isOnline;
      this.cranes[index].update(item);
      if(!!type || oldOnline != item.isOnline){
        this.registerEven(this.cranes[index]);
      }
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
        if(crane.name === item.craneAlias){
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
    const {craneAlias,sn,recordTime,x = 0,y = 0,craneType = 0,height = 0,isOnline = false,inputState = 0,
      rotationAngle = 0,radius = 0,armLength = 0,balanceArmLength = 0,warning = 0,alarm = 0,peccancy = 0} = this.state.clickCrane;
    const newInputState = inputState & 0x40;
    let title = formatMessage({id:'app.monitor.warning-info'}),content = [],empty = formatMessage({id:'app.monitor.no-warning'}),index = 0;
    const result = showAlarmInfo({warning:warning,alarm:alarm,peccancy:peccancy,isFilter:1});
    if(result.warning.length){
      content.push(<div className='warning' key={index}>{result.warning.join()}</div>);
      index++;
    }
    if(result.alarm.length){
      content.push(<div className='alarm' key={index}>{result.alarm.join()}</div>);
      index++;
    }
    if(result.peccancy.length){
      content.push(<div className='peccancy' key={index}>{result.peccancy.join()}</div>);
      index++;
    }
    return (
      <Row type='flex' className='viewBg-color'>
        <Col xxl={18} xl={16} xs={24} id = 'container'/>
        <Col xxl={6} xl={8} xs={0} className={styles.craneInfo}>
          <Row>
            <Row className={styles.title}><FormattedMessage id='app.monitor.crane-info'/></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.crane-name'/></Col><Col span={12}>{craneAlias}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.crane-sn'/></Col><Col span={12}>{sn}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.record-time'/></Col><Col span={12}>{recordTime}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.online-status'/></Col><Col span={12}>
              <div className={isOnline ? 'warning' : 'alarm'}>{isOnline ? formatMessage({id:'app.common.online'}) : formatMessage({id:'app.common.offline'})}</div>
            </Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.crane-type'/></Col><Col span={12}>{!craneType ? formatMessage({id:'app.common.flat-crane'}) : craneType === 1 ? formatMessage({id:'app.common.movable-crane'}) : formatMessage({id:'app.common.head-crane'})}</Col></Row>
            <Row className={styles.content}><Col span={12}>ByPass</Col><Col span={12}>
              <div className={!newInputState ? 'warning' : 'alarm'}>{!newInputState ? formatMessage({id:'app.monitor.open'}) : formatMessage({id:'app.monitor.close'})}</div>
            </Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.rotationAngle'/>（°）</Col><Col span={12}>{rotationAngle.toFixed(1)}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.radius'/>（m）</Col><Col span={12}>{radius.toFixed(1)}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.height'/>（m）</Col><Col span={12}>{height.toFixed(1)}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.armLength'/>（m）</Col><Col span={12}>{armLength}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.balanceArmLength'/>（m）</Col><Col span={12}>{balanceArmLength}</Col></Row>
            <Row className={styles.content}><Col span={12}>{title}</Col><Col span={12}>{content.length ? content : empty}</Col></Row>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default CraneSpread;
