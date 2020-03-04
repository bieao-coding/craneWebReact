/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input,Card,Button,Row,Col,message } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
import {closeSocket,sendCmd} from "@/utils//websocket";
const FormItem = Form.Item;
@connect(({}) => ({
}))
@Form.create()
class CraneUp extends Component {
  state = {
    readLoading:false,
    writeLoading:false,
    upLoading:false,
    upResult:null,
    text:'',
    state:0,
    time:'',
    params:{
      lastHeight: null,//上次塔高
      currentHeight: null, //目前塔高
      raiseHeight: null,//提升高度
    },
    raiseHeight:null
  };
  // DOM加载完成后执行
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id},()=>{
        sendCmd({cmd:'CraneHeightRaise',vo:{},craneId:this.state.id,rwStatus:'L'},this.showData)
      });
    }
  }
   /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.id !== currentState.id){
      this.setState({id:nextState.id},()=>{
         sendCmd({cmd:'CraneHeightRaise',vo:{},craneId:this.state.id,rwStatus:'L'},this.showData)
      })
    }
  }
  /*接受返回值*/
  showData = (data) => {
    if(JSON.parse(data)){
      const res = JSON.parse(data);
      console.log(data);
      if(res.status === 'Success' && !!res.vo){
        if(!!res.rwStatus){
          if(res.rwStatus === 'R'){
            if(res.vo.readStatus === 'Success'){
              this.setState({text:formatMessage({id:'app.device.read'}),state:1,time:res.vo.readTime});
              message.success(formatMessage({id:'app.device.read-success'}));
            }else{
              this.setState({text:formatMessage({id:'app.device.read'}),state:0,time:''});
              message.error(formatMessage({id:'app.device.read-success'}));
            }
          }else if(res.rwStatus === 'W'){
            if(res.vo.writeStatus === 'Success'){
              this.setState({text:formatMessage({id:'app.device.set'}),state:1,time:res.vo.writeTime});
              message.success(formatMessage({id:'app.device.set-success'}));
            }else{
              this.setState({text:formatMessage({id:'app.device.set'}),state:0,time:''});
              message.error(formatMessage({id:'app.device.set-fail'}));
            }
          }
        }else{
          this.setState({text:'',state:0,time:''});
        }
        this.props.form.resetFields();
        this.setState({params:res.vo,readLoading:false,writeLoading:false});
      }else{
        message.error(res.message);
        this.setState({text:'',state:0,time:'',readLoading:false,writeLoading:false});
      }
    }
  };
  showProcess = (data) => {
    if(JSON.parse(data)){
      const res = JSON.parse(data);
      console.log(data);
      if(res.status === 'Success' && !!res.vo){
        if(!!res.rwStatus){
          if(res.rwStatus === 'R'){
            this.setState({upLoading:false});
            this.resolveResult(res.vo);
          }
        }else{
          this.setState({upResult:'',upLoading:false});
        }
      }else{
        message.error(res.message);
        this.setState({upResult:'',upLoading:false});
      }
    }
  };
  /*处理结果*/
  resolveResult(data){
    const before32 = data.craneNumber32;
    const after64 = data.craneNumber64;
    const broadcast = data.broadcast;
    const count = data.count;
    const noEnd = [];
    for(let i = 0; i < 32; i++){
      if(!((before32 >> i) & 0x01)){
        noEnd.push(i + 1);
      };
      if(!((after64 >> i) & 0x01)){
        noEnd.push(i + 1 + 32);
      };
    }
    const html = (
      <Row type="flex" align = 'middle'>
        <span className='m-r-10'>
          <span><FormattedMessage id='app.device.play-status'/>：</span>
          <span style={{color:broadcast ? 'red' : 'green'}}>{broadcast ? formatMessage({id:"app.device.play-doing"}) : formatMessage({id:"app.device.play-end"})}</span>
        </span>
        <span className='m-r-10'>
          <span><FormattedMessage id='app.device.play-progress'/>：</span>
          <span style={{color:'green'}}>{(!count ? 0 : Math.floor((1 - noEnd.length/count) * 100)) + '%'}</span>
        </span>
        <span className={noEnd.length ? 'show' : 'hide'}>
          <span><FormattedMessage id='app.device.play-fail-cranes'/>：</span>
          <span style={{color:'red'}}>{noEnd.map((item)=>'TC' + item).join('、')}</span>
        </span>
      </Row>
    );
    this.setState({upResult:html});
  }
  /*读取参数*/
  readParams = () =>{
    this.setState({readLoading:true});
    sendCmd({cmd:'CraneHeightRaise',vo:{},craneId:this.state.id,rwStatus:'R'},this.showData);
  };
  /*设置参数*/
  handleSubmit = (e) =>{
    this.setState({writeLoading:true});
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err){
        this.setState({writeLoading:false});
        return;
      }
      const {currentHeight} = this.state.params;
      const params = {...this.state.params,...values,...{raiseHeight:values.currentHeight - currentHeight}};
      delete params.readStatus;
      delete params.readTime;
      delete params.writeStatus;
      delete params.writeTime;
      delete params.insertTime;
      delete params.updateTime;
      delete params.initStatus;
      delete params.craneId;
      delete params.id;
      sendCmd({cmd:'CraneHeightRaise',vo:params,craneId:this.state.id,rwStatus:'W'},this.showData);
    });
  };
  readProcess = () => {
    this.setState({upLoading:true});
    sendCmd({cmd:'CraneBroadcast',vo:{},craneId:this.state.id,rwStatus:'R'},this.showProcess);
  };
  /*渲染*/
  render() {
    const { getFieldDecorator } = this.props.form;
    //自适应
    const formItemLayout = {
      labelCol: {
        sm: { span: 24 },
        md: { span: 24 },
        lg: { span: 24 },
        xl: { span: 8 },
      },
      wrapperCol: {
        sm: { span: 24 },
        md: { span: 24 },
        lg: { span: 24 },
        xl: { span: 8 },
      },
    };
    // 验证规则
    const formRules = {
      lastHeight:{
        //rules:[{required: true,pattern: new RegExp(/^\d+$/), message:'请输入数字密码'}],
        initialValue:this.state.params.lastHeight
      },
      currentHeight:{
        rules:[{required: true,pattern: new RegExp(/^[1-9](\d+)?$/), message:formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.currentHeight
      },
      raiseHeight:{
        //rules:[{required: true, pattern: new RegExp(/^[1-9](\d+)?$/), message:'请输入合法数字'}],
        initialValue:this.state.params.raiseHeight
      },
    };
    const {text,state,time,readLoading,writeLoading,upLoading,upResult} = this.state;
    return (
      <div>
        <Row type="flex" align="middle" id = 'title'>
          <Col className='p-b-10'>
            <Button type="primary" icon="search" onClick={this.readParams} loading = {readLoading}><FormattedMessage id='app.device.read-params'/></Button>
            <Button type="primary" icon="save" disabled={!text} className='m-l-10 m-r-10' onClick={this.handleSubmit} loading = {writeLoading}><FormattedMessage id='app.device.set-params'/></Button>
          </Col>
          <Col xl={15} md={24} className={!!text ? 'show p-b-10 title-style':'hide p-b-10 title-style'}>
            <Row type="flex" align = 'middle'>
              <span className='m-r-10'>
                <span>{text}<FormattedMessage id='app.device.status'/>：</span>
                <span className={ state ? 'success-color' : 'default-color'}>{state ? formatMessage({id:"app.device.success"}) : formatMessage({id:"app.device.fail"})}</span>
              </span>
              <span className={state ? 'show':'hide'}>
                <span>{text}<FormattedMessage id='app.device.time'/>：</span>
                <span className={ state ? 'success-color' : 'default-color'}>{state ? time : ''}</span>
              </span>
            </Row>
          </Col>
        </Row>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.currentHeight'})}
          >
            {getFieldDecorator('currentHeight', formRules.currentHeight)(
              <Input />
            )}
          </FormItem>
        </Form>
        <Row type="flex" align="middle" className='p-t-10'>
          <Col className='m-r-10'>
            <Button type="primary" icon="search" onClick={this.readProcess} loading = {upLoading}><FormattedMessage id='app.device.watch-progress'/></Button>
          </Col>
          <Col xl={20} md={24} className='title-style'>
            {upResult}
          </Col>
        </Row>
      </div>
    )
  }
};
export default CraneUp;
