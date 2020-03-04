/*eslint-disable*/
import React, {PureComponent} from 'react';
import {Input,Row,Card,Col,Tooltip } from 'antd';
import {transSecondsToFormat} from '@/utils/utils'
import moment from 'moment';
import styles from './index.less';
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const prePxToSecond = 30/3600;
class CommonGantt extends PureComponent{
  resolveData(sns,dates,data){
    const snEle = [],dateEle = [],hourEle = [],squareEle = [];
    sns.forEach((item,index)=>{
      const ele = [];
      snEle.push(<Col className={styles.sn} key={index}>{item}</Col>);
      const obj = data[item] || {}; // 获取到sn的所有数据
      dates.forEach((date)=>{
        const times = !!obj[date] ? obj[date].details : []; // 获取到某一天的数据
        const hourObj = {};
        times.forEach((item)=>{
          const beginTime = moment(item.beginTime, dateFormat);
          const hour = beginTime.hour();
          if(!hourObj[hour]) hourObj[hour] = [];
          hourObj[hour].push(item);
        });
        for(let i = 0; i< 24; i++){
          const list = hourObj[i];
          if(!!list){
            const span = [];
            list.forEach((item,index)=>{
              const initSecond = moment(`${date} ${i}:00:00`,dateFormat);
              const beginTime = moment(item.beginTime, dateFormat);
              const diff = beginTime.diff(initSecond,'s');
              const leftPx = diff * prePxToSecond;
              const widthPx = item.onlineSeconds * prePxToSecond;
              const text = (<div>
                <div>时间范围：{`${item.beginTime} ~ ${item.endTime}`}</div>
                <div>时长：{transSecondsToFormat(item.onlineSeconds)}</div>
                <div>距上次掉线时长：{transSecondsToFormat(item.lastOfflineSeconds)}</div>
                <div>重上线次数：{item.reonlineTimes}</div>
                <div>错误数据数：{item.errorRecordTimes}</div>
              </div>);
              span.push(<Tooltip key={index} placement="bottomLeft" title={text}><span onClick={() => this.clickRange(item)} className={styles.range} style={{width:`${widthPx}px`,left:`${leftPx}px`,backgroundColor:!item.errorRecordTimes ? '#40a9ff':'#cc1212'}}/></Tooltip>);
            });
            ele.push(<Col key={`${date}_${i}`}>{span}</Col>);
          }else{
            ele.push(<Col key={`${date}_${i}`}/>);
          }

        }
      });
      squareEle.push(<Col className={styles.square}>{ele}</Col>);
    });
    dates.forEach((item,index)=>{
      dateEle.push(<Col key={index}>{item}</Col>);
      for(let i = 0; i< 24; i++){
        hourEle.push(<Col key={`${item}_${i}`}>{i}</Col>);
      }
    });
    return {snEle,dateEle,hourEle,squareEle}
  }
  clickRange = (item) => {
    if(this.props.clickRange) this.props.clickRange(item);
  };
  render(){
    const {sns,dates,data}  = this.props;
    const result = this.resolveData(sns,dates,data);
    const {snEle,dateEle,hourEle,squareEle} = result;
    return (
      <Row className={styles.commonGantt}>
        <Col className={styles.title}>
          <Col className={styles.titleName}>SN</Col>
          {snEle}
        </Col>
        <Col className={styles.content}>
          <Col className={styles.year}>
            {dateEle}
          </Col>
          <Col className={styles.hour}>
            {hourEle}
          </Col>
          {squareEle}
        </Col>
      </Row>
    );
  }
}
export default CommonGantt;
