/*eslint-disable*/
import React, {PureComponent} from 'react';
import {Form,Row,Col,Icon} from 'antd';
import { MiniProgress } from '@/components/Charts';
import styles from './cardView.less';
const FormItem = Form.Item;

class CardView extends PureComponent{
  constructor(props){
    super(props);
  }
  value = ['normal','warning','alarm','peccancy'];
  render(){
    const {title,icon,currentNum,unit,minNum,maxNum,alarmTitle,alarmDeep = 0}  = this.props;
    return (
      <div className={styles.content}>
        <Row className={styles.cardView}>
          <Row type='flex' justify='space-between' align='center'>
            <Col className={styles.cardViewTitle}>{title}</Col>
            <Col className={styles.picture}>
              <i className = {['iconfont',icon].join(' ')}/>
            </Col>
          </Row>
          <Row>
            <Col>
              <span className={styles.viewNumber}>{currentNum}</span> {unit}
            </Col>
            <Col>
              <MiniProgress percent={(currentNum/maxNum) * 100} strokeWidth={8} target={100} color="#1890FF"/>
            </Col>
          </Row>
          <Row type='flex' justify='space-between'>
            <Col>{minNum}</Col>
            <Col>{maxNum}</Col>
          </Row>
        </Row>
        <Row className={[styles.alarmView,styles[[this.value[alarmDeep]]]].join(' ')}>
          <Col className={styles.title}>{alarmTitle}</Col>
          <Col className={styles.typeView} />
        </Row>
      </div>
    );
  }
}
export default CardView;
