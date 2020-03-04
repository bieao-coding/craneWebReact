/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { connect } from 'dva';
import {Row,Col,DatePicker,Select,Button,message,Table,Tag} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import * as PIXI from "pixi.js";
import {cutPoint,showAlarmInfo} from '@/utils/utils'
import AnimationTwo from "../common/animation";
import styles from './craneHistory.less';
import moment from 'moment';
import north from "../../../../assets/images/north.png";
const { RangePicker } = DatePicker;
const Option = Select.Option;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
@connect(({ }) => ({

}))
class CraneHistory extends Component {
  state = {
    clickCrane:{},
    showNowTime:null,
    playStatus:0,
    isPlay:false,
  };
  isFirst = true;
  pixi = null;
  projectId = null;
  containerHeight = 0;
  containerWidth = 0;
  data = [];  //塔机数据
  rangeData = {}; //时间段内的总数据
  coordinate = [];//动画所用数据
  cranes = [];
  loopTimer = null;
  index = 0;
  beginTime = null;
  endTime = null;
  requestBeginTime = null;//请求的开始时间
  requestEndTime = null;//请求的结束时间
  rangeCurrentTime = null; //片段中的当前时间
  isChange = true;
  speed = 1;
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
  orgData = {minBorderX:0,minBorderY:0,height:0,width:0};
  projectPicture = {};
  scale = 0;
  /*DOM加载完成后执行*/
  componentDidMount() {
    const height = window.innerHeight - 50 - 20 - 40 - 38 - 60 - 53 - 2;
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
            initOk.push({...item,...{screenAngle:270,radius:item.armLength,isOnline:false},...{area:areaArray,areaAttribute}});
          }else{
            noInit.push(item)
          }
        });
        this.noInitCrane(noInit);
        this.data = initOk;
        this.calculateScale();
        if(this.data.length){
          this.setState({clickCrane:this.data[this.index],playStatus:1});
          this.calculate();
          this.initCrane();
          this.loopUpdate(1);
          this.initAnimate();
        }else{
          this.setState({clickCrane:{},playStatus:0})
        }
      }
    });
  };
  /*未初始化*/
  noInitCrane(data){
    let lastWidth = 0;
    let lastX = this.containerWidth;
    if(data.length) data.unshift({craneNumber:formatMessage({id:'app.monitor.no-init-crane'})});
    data.reverse();
    data.forEach((item,index)=>{
      const richText = new PIXI.Text((index !== data.length - 1 && index) ? item.craneNumber + '、' : item.craneNumber, this.style);
      lastWidth = richText.width;
      richText.x = lastX - lastWidth;
      lastX = richText.x;
      richText.y = 5;
      this.pixi.stage.addChild(richText);
    });
  }
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
  /*添加指北针*/
  addNorth(){
    this.north = new this.Sprite(this.loader.resources.north.texture);
    this.north.position.set(10,10);
    this.pixi.stage.addChild(this.north);
  }
  /*处理时间划分时段去请求*/
  resolveTime = (type) => {
    if(!this.requestBeginTime) this.requestBeginTime = this.beginTime;
    if(type) this.requestBeginTime = this.requestEndTime;
    const time = JSON.parse(JSON.stringify(this.requestBeginTime));
    const nextMinute = moment(time).add(2,'m');//加2分钟
    if(nextMinute.diff(this.endTime,'s') >= 0){
      this.requestEndTime = this.endTime;
    }else{
      this.requestEndTime = nextMinute;
    }
  };
  /*点击播放*/
  clickGo = () => {
    if(!this.beginTime || !this.endTime) return;
    this.setState({isPlay:true});
    if(this.isChange){
      this.requestBeginTime = null;
      this.rangeCurrentTime = null;
      this.requestEndTime = null;
      this.rangeData = {};
      this.pixi.ticker.stop();
      this.data.forEach((item)=>{
        Object.assign(item,{isOnline:false});
      });
      if(this.loopTimer)  clearInterval(this.loopTimer);
      this.isFirst = true;
      this.resolveTime(0);
      this.getHistoryData();
    }else{
      this.calcTime();
      this.speedChange(this.speed);
    }
  };
  /*点击暂停*/
  clickPause = () => {
    this.isChange = false;
    this.setState({isPlay:false});
    this.pixi.ticker.stop();
    if(this.loopTimer)  clearInterval(this.loopTimer);
  };
  /*点击重放*/
  clickReplay = () => {
    this.isChange = true;
    this.clickGo();
  };
  getHistoryData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getHistoryData',
      payload:{queryType:1,projectId:this.projectId,beginTime:moment(this.requestBeginTime).format(dateFormat),endTime:moment(this.requestEndTime).format(dateFormat)},
      callback:(res)=>{
        this.resolveTimeList(res);
        if(this.isFirst){
          this.calcTime();
          this.speedChange(this.speed);
        }
      }
    });
  };
  /*处理获取到的时间list*/
  resolveTimeList = (data) => {
    for(const key in data){
      if(data[key].length){
        const obj = {};
        data[key].forEach((item)=>{
          obj[item.craneId] = item;
        });
        this.rangeData[key] = {...this.rangeData[key],...obj};
      }
    };
  };
  /*计算当前的时间*/
  calcTime = () => {
    if(!this.rangeCurrentTime){
      this.rangeCurrentTime = moment(this.requestBeginTime).format(dateFormat);
    }else{
      if(this.requestEndTime.diff(moment(this.rangeCurrentTime),'s') <= 0){
        if(this.loopTimer)  clearInterval(this.loopTimer);
        this.setState({isPlay:false});
        return;
      }
      if(this.requestEndTime.diff(moment(this.rangeCurrentTime),'s') <= 20){  //小于20秒再次请求
        for(const key in this.rangeData){
          if(moment(key).diff(moment(this.rangeCurrentTime),'s') <= 0){
            delete this.rangeData[key];  //清除已执行过的数据
          }
        }
        this.resolveTime(1);
        if(this.requestBeginTime.diff(this.requestEndTime,'s') < 0){  //最后不请求做完剩下的
          this.getHistoryData();
        }
      }

      this.rangeCurrentTime = moment(this.rangeCurrentTime).add(1,'s').format(dateFormat);//加一秒
      this.setState({showNowTime:this.rangeCurrentTime});
    }
    const newData = this.data.map((item)=>{
      const value = this.rangeData[this.rangeCurrentTime];
      if(value && value[item.craneId]){
        item = {...item,...value[item.craneId]};
      }else if(!this.isOffline(item.craneId)){
        item = {...item,...{isOnline:false}};
      }
      return item;
    });
    this.data = newData;
    this.setState({clickCrane:this.data[this.index]});
    this.calculate();
    this.loopUpdate();
  };
  /*判断是否掉线*/
  isOffline(craneId){
    let flag = false;
    // 此刻时间加一分钟如果大于requestEndTime，说明不管有没有数据这个塔机都在在线
    // 相反，如果小于requestEndTime，说明有一分钟的数据用来判断是否是掉线
    const maxTime = moment(this.rangeCurrentTime).add(1,'m');
    if(maxTime.diff(this.requestEndTime,'s') > 0){
      flag = true;
    }else{
      for(let i = 1; i <= 60; i++){
        const nextTime = moment(this.rangeCurrentTime).add(i,'s').format(dateFormat);
        if(this.rangeData[nextTime] && this.rangeData[nextTime][craneId]){
          flag = true;
        }
      }
    }
    return flag;
  }
  /*定时请求*/
  timerRequest500 = () => {
    this.loopTimer = setInterval(()=>{
      this.isFirst = false;
      this.calcTime();
    },500);
  };
  /*定时请求*/
  timerRequest1000 = () => {
    this.loopTimer = setInterval(()=>{
      this.isFirst = false;
      this.calcTime();
    },1000);
  };
  /*定时请求*/
  timerRequest2000 = () => {
    this.loopTimer = setInterval(()=>{
      this.isFirst = false;
      this.calcTime();
    },2000);
  };

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
      const alarmResult = showAlarmInfo({warning:item.warning,alarm:item.alarm,peccancy:item.peccancy,hasIndex:1,isFilter:1});
      coordinate.push({craneId:item.craneId,x:x,y:y, area:area,
        areaAttribute,arm:arm,isOnline:isOnline,balanceArm:balanceArm,radius:radius,rotation:rotation,craneType:craneType,name:name,alarmResult:alarmResult});
    });
    this.coordinate = this.resolveCanvas(coordinate);
  };
  /*画布局中*/
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
      const crane = new AnimationTwo();
      crane.draw({...item,...{app:this.pixi}});
      this.cranes.push(crane);
    })
  }
  /*循环更新*/
  loopUpdate(type){
    this.coordinate.forEach((item,index)=>{
      const oldOnline = this.cranes[index].isOnline;
      this.cranes[index].update({...item,...{speed:this.speed}});
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
    item.crane.on('pointertap',function(){
      const crane = this;
      self.data.forEach((item,index)=>{
        if(crane.name === item.craneAlias){
          self.index = index;
          self.setState({clickCrane:self.data[index]})
        }
      })
    })
  }
  /*时间的变化*/
  onChange = (value) => {
    if( value[0].diff(this.beginTime,'s') != 0 || value[1].diff(this.endTime,'s') != 0){
      this.isChange = true;
    }
    this.beginTime = value[0];
    this.endTime = value[1];
  };
  /*播放速度的变化*/
  speedChange = (value) =>{
    this.speed = value;
    if(this.loopTimer)  clearInterval(this.loopTimer);
    switch(value){
      case 2:
        this.timerRequest1000();
        break;
      case 3:
        this.timerRequest500();
        break;
      default:
        this.timerRequest2000();
        break;
    }
  };
  /*禁止日期*/
  disabledDate = (current) => {
    return current && current > moment().endOf('day');
  };
  /*卸载*/
  componentWillUnmount(){
    //this.loader.reset();
    if(this.loopTimer)  clearInterval(this.loopTimer);
    this.pixi.ticker.stop();
  };
  render() {
    const {showNowTime,isPlay} = this.state;
    const {craneAlias,sn,recordTime,x = 0,y = 0,craneType,height = 0,inputState = 0,rotationAngle = 0,radius = 0,armLength = 0,balanceArmLength = 0,warning = 0,alarm = 0,peccancy = 0} = this.state.clickCrane;
    const newInputState = inputState & 0x40;
    let title = formatMessage({id:'app.monitor.warning-info'}),content = [],empty = formatMessage({id:'app.monitor.no-warning'}),index = 0;
    const result = showAlarmInfo({warning:warning,alarm:alarm,peccancy:peccancy,isFilter:0});
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
        <Col xxl={18} xl={16} xs={24} className='flex flex-column'>
          <Row className={styles.chooseTime}>
            <Col span={19}>
              <RangePicker
                disabled={isPlay}
                allowClear={false}
                className='m-r-10'
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={[formatMessage({id:'app.common.beginTime'}), formatMessage({id:'app.common.endTime'})]}
                disabledDate={this.disabledDate}
                onChange={this.onChange}
              />
              {!isPlay ? ( <Button type="primary" className='m-r-10'  icon="play-circle" onClick={this.clickGo}>
                <FormattedMessage id='app.monitor.play'/>
              </Button>) : (
                <Button type="primary" className='m-r-10' icon="pause" onClick={this.clickPause}>
                  <FormattedMessage id='app.monitor.pause'/>
                </Button>
              )}
              <Button type="primary" icon="retweet" disabled={isPlay} onClick={this.clickReplay}>
                <FormattedMessage id='app.monitor.replay'/>
              </Button>
            </Col>
            <Col span={5} className='text-right'>
              <Select defaultValue={1} style={{ width: 80 }} onChange={this.speedChange}>
                <Option value={1}><FormattedMessage id='app.monitor.common'/></Option>
                <Option value={2}><FormattedMessage id='app.monitor.two'/></Option>
                <Option value={3}><FormattedMessage id='app.monitor.four'/></Option>
              </Select>
            </Col>
          </Row>
          <Row className='auto-flex' id = 'container'/>
        </Col>
        <Col xxl={6} xl={8} xs={0} className={[styles.craneInfo,'auto-overflow'].join(' ')}>
          <Row>
            <Row className={styles.title}><FormattedMessage id='app.monitor.crane-info'/>{showNowTime ? `（${showNowTime}）` : ''}</Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.crane-name'/></Col><Col span={12}>{craneAlias}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.crane-sn'/></Col><Col span={12}>{sn}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.record-time'/></Col><Col span={12}>{recordTime}</Col></Row>
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

export default CraneHistory;
