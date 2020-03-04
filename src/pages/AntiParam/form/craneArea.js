/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { Form, Input, Card, Button, Row, Col, Progress, message } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import success from "../../../assets/images/success.png";
import error from "../../../assets/images/error.png";
import {closeSocket,sendCmd} from "@/utils//websocket";
import styles from './craneArea.less';
const params = {area1: null,area2: null,area3: null,area4: null,area5: null,area6: null,area7: null,area8: null,area9: null,area10: null};
const attribution = {attribution1: null,attribution2: null,attribution3: null,attribution4: null,attribution5: null,attribution6: null, attribution7: null, attribution8: null, attribution9: null, attribution10: null};
@connect(({}) => ({
}))
@Form.create()
class CraneArea extends Component {
  state = {
    readLoading:false,
    params:{
      area1: null,
      area2: null,
      area3: null,
      area4: null,
      area5: null,
      area6: null,
      area7: null,
      area8: null,
      area9: null,
      area10: null,
    },
    attribution:{
      attribution1: null,
      attribution2: null,
      attribution3: null,
      attribution4: null,
      attribution5: null,
      attribution6: null,
      attribution7: null,
      attribution8: null,
      attribution9: null,
      attribution10: null,
    }
};
  // DOM加载完成后执行
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id});
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.id !== currentState.id){
      this.setState({id:nextState.id},()=>{
        this.setState({params,attribution});
      })
    }
  }
  /*接受返回值*/
  showData = (data) => {
    if(JSON.parse(data)){
      const res = JSON.parse(data);
      console.log(data);
      if(res.status === 'Success' && !!res.vo){
        const num = res.craneAreaNumber;
        const {params,attribution} = this.state;
        if(res.vo.readStatus === 'Success'){
          const obj = {},attr = {};
          obj['area' + num] = 100;
          attr['attribution' + num] = res.vo.validFlag !== '0x0000';
          this.setState({params:{...params,...obj},attribution:{...attribution,...attr},readLoading:false});
        }else{
          const obj = {},attr = {};
          obj['area' + num] = 0;
          attr['attribution' + num] = res.vo.validFlag !== '0x0000';
          this.setState({params:{...params,...obj},attribution:{...attribution,...attr},readLoading:false});
        }
      }else{
        message.error(res.message);
        this.setState({params:params,readLoading:false});
      }
    }
  };

  /*读取参数*/
  readParams = () =>{
    this.setState({readLoading:true,params,attribution});
    sendCmd({cmd:'CraneArea',vo:{},craneId:this.state.id,rwStatus:'R'},this.showData);
  };
  /*渲染*/
  render() {
    const {readLoading} = this.state;
    const {area1,area2,area3,area4,area5,area6,area7,area8,area9,area10} = this.state.params;
    const {attribution1,attribution2,attribution3,attribution4,attribution5,attribution6,attribution7,attribution8,attribution9,attribution10} = this.state.attribution;
    const loop = [];
    for(let i = 1; i < 11; i++){
      loop.push(
        <Row key={i} type='flex' className={[styles.area,'m-b-20'].join(' ')}>
          <Col xl={8}  md={24}>
            {`A${i}`}
            {
              eval('attribution' + i) === null ? (<Fragment></Fragment>):(eval('attribution' + i) ? <span className={styles.resultSuccess}>({formatMessage({id:'app.device.used'})})</span> : <span className={styles.resultError}>({formatMessage({id:'app.device.no-used'})})</span>)
            }：
            {eval(`area` + i) !== null ? (
              eval(`area` + i) === 100 ? (
                <img className='m-l-10' width={20} src={success}/>
              ):(
                <img className='m-l-10' width={20} src={error}/>
              )
            ):(<Fragment></Fragment>)}
          </Col>
        </Row>
      )
    }
    return (
      <div>
        <Row type="flex" align="middle" id = 'title'>
          <Col className='p-b-10'>
            <Button type="primary" icon="search" onClick={this.readParams} loading = {readLoading}><FormattedMessage id='app.device.read-params'/></Button>
          </Col>
        </Row>
        {loop}
      </div>
    )
  }
};
export default CraneArea;
