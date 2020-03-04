/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { connect } from 'dva';
import {Row,Col,DatePicker,Select,Button,message,Table,Tag} from 'antd';
import * as PIXI from "pixi.js";
import {translateDecare,cutPoint,showAlarmInfo} from '@/utils/utils'
import AnimationTwo from "../common/animation2";
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
            Object.assign(item,{rotationAngle:0,radius:item.armLength});
            initOk.push(item);
          }else{
            noInit.push(item)
          }
        });
        this.noInitCrane(noInit);
        this.data = initOk;
        if(this.data.length){
          this.setState({clickCrane:this.data[this.index],playStatus:1});
          this.calculate();
          this.initCrane();
          this.loopUpdate();
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
    if(data.length) data.unshift({craneNumber:'未初始化塔机：'});
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
  /*处理时间划分时段去请求*/
  resolveTime = (type) => {
    if(!this.requestBeginTime) this.requestBeginTime = this.beginTime;
    if(type) this.requestBeginTime = this.requestEndTime;
    const time = JSON.parse(JSON.stringify(this.requestBeginTime));
    const nextMinute = moment(time).add(1,'m');//加一分钟
    if(nextMinute.diff(this.endTime) >= 0){
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
  getHistoryData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getHistoryData',
      payload:{projectId:this.projectId,beginTime:moment(this.requestBeginTime).format(dateFormat),endTime:moment(this.requestEndTime).format(dateFormat)},
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
          obj[item.recordTime] = item;
        });
        this.rangeData[key] = {...this.rangeData[key],...obj};
      }
    };
  };
  /*计算当前的时间*/
  calcTime = () => {
    if(!this.rangeCurrentTime){
      const firstTimes = [];
      for(const item in this.rangeData){
        firstTimes.push(Object.keys(this.rangeData[item])[0])
      }
      this.rangeCurrentTime = firstTimes.sort(this.compare)[0];
      if(!this.rangeCurrentTime) this.rangeCurrentTime = this.requestBeginTime;
    }else{
      if(this.requestEndTime.diff(moment(this.rangeCurrentTime)) <= 0){
        if(this.loopTimer)  clearInterval(this.loopTimer);
        this.setState({isPlay:false});
        return;
      }
      if(this.requestEndTime.diff(moment(this.rangeCurrentTime)) >= 20000 && this.requestEndTime.diff(moment(this.rangeCurrentTime)) <= 21000){  //小于20秒再次请求
        for(const item in this.rangeData){
          for(const key in this.rangeData[item]){
            if(moment(key).diff(moment(this.rangeCurrentTime)) < 0){
              delete this.rangeData[item][key];  //清除已执行过的数据
            }
          }
        }
        this.resolveTime(1);
        if(this.requestBeginTime.diff(this.requestEndTime) < 0){  //最后不请求做完剩下的
          this.getHistoryData();
        }
      }
      this.setState({showNowTime:this.rangeCurrentTime})
      this.rangeCurrentTime = moment(this.rangeCurrentTime).add(1,'s').format(dateFormat);//加一秒
    }
    const newData = this.data.map((item)=>{
      if(this.rangeData[item.craneId] && this.rangeData[item.craneId][this.rangeCurrentTime]){
        return {...item,...this.rangeData[item.craneId][this.rangeCurrentTime]}
      }
      return item;
    });
    this.data = newData;
    this.setState({clickCrane:this.data[this.index]})
    this.calculate();
    this.loopUpdate();
  };
  /*比较大小*/
  compare = () => {
    return (a,b)=>{
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    }
  };
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
      coordinate.push({craneId:item.craneId,x:x,y:y,arm:arm,balanceArm:balanceArm,radius:radius,rotation:rotation,craneType:craneType,name:name});
    });
    this.coordinate = this.resolveCanvas(coordinate,width,height,scaleMin);
  };
  /*画布局中*/
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
      const crane = new AnimationTwo();
      crane.draw({...item,...{app:this.pixi}});
      this.registerEven(crane);
      this.cranes.push(crane);
    })
  }
  /*循环更新*/
  loopUpdate(){
    this.coordinate.forEach((item,index)=>{
      this.cranes[index].update({...item,...{speed:this.speed}});
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
        if(crane.name === item.craneNumber){
          self.index = index;
          self.setState({clickCrane:self.data[index]})
        }
      })
    })
  }
  /*时间的变化*/
  onChange = (value, dateString) => {
    this.isChange = true;
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
    const {showNowTime,playStatus,isPlay} = this.state;
    const {craneNumber,sn,recordTime,x = 0,y = 0,craneType,height = 0,rotationAngle = 0,radius = 0,armLength = 0,balanceArmLength = 0,warning = 0,alarm = 0,peccancy = 0} = this.state.clickCrane;
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
        <Col xxl={18} xl={16} xs={24} className='flex flex-column'>
          <Row className={styles.chooseTime}>
            <Col span={19}>
              <RangePicker
                disabled={isPlay}
                allowClear={false}
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['开始时间', '结束时间']}
                disabledDate={this.disabledDate}
                onChange={this.onChange}
              />
              {!isPlay ? ( <Button type="primary" className='m-l-10' icon="play-circle" disabled={!playStatus} onClick={this.clickGo}>
                播放
              </Button>) : (
                <Button type="primary" className='m-l-10' icon="pause" disabled={!playStatus} onClick={this.clickPause}>
                  暂停
                </Button>
              )}
            </Col>
            <Col span={5} className='text-right'>
              <Select defaultValue={1} style={{ width: 80 }} onChange={this.speedChange}>
                <Option value={1}>正常</Option>
                <Option value={2}>2倍</Option>
                <Option value={3}>4倍</Option>
              </Select>
            </Col>
          </Row>
          <Row className='auto-flex' id = 'container'/>
        </Col>
        <Col xxl={6} xl={8} xs={0} className={[styles.craneInfo,'auto-overflow'].join(' ')}>
          <Row>
            <Row className={styles.title}>塔机详参{showNowTime ? `（${showNowTime}）` : ''}</Row>
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

export default CraneHistory;
