/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input,Card,Button,Row,Col,Switch,message } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {sendCmd} from "@/utils/websocket";
const FormItem = Form.Item;
@connect(({}) => ({
}))
@Form.create()
class ByPass extends Component {
  state = {
    readLoading:false,
    writeLoading:false,
    text:'',
    state:0,
    time:'',
    params:{
      bypass:false
    }
  };
  // DOM加载完成后执行
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id},()=>{
        sendCmd({cmd:'CraneByPassSwitch',vo:{},craneId:this.state.id,rwStatus:'L'},this.showData)
      });
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.id !== currentState.id){
      this.setState({id:nextState.id},()=>{
        sendCmd({cmd:'CraneByPassSwitch',vo:{},craneId:this.state.id,rwStatus:'L'},this.showData)
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
              message.error(formatMessage({id:'app.device.read-fail'}));
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
        const vo = res.vo;
        this.setState({params:{bypass:Boolean(vo.bypass)},readLoading:false,writeLoading:false});
      }else{
        message.error(res.message);
        this.setState({text:'',state:0,time:'',readLoading:false,writeLoading:false});
      }
    }
  };
  /*读取参数*/
  readParams = () =>{
    this.setState({readLoading:true});
    sendCmd({cmd:'CraneByPassSwitch',craneId:this.state.id,rwStatus:'R'},this.showData);
  };
  /*设置参数*/
  handleSubmit = (e) =>{
    this.setState({writeLoading:true});
    e.preventDefault();
    this.props.form.validateFields((err,values) => {
      if (err){
        this.setState({writeLoading:false});
        return;
      }
      const params = {...this.state.params,...{bypass:Number(values.bypass)}};
      sendCmd({cmd:'CraneByPassSwitch',vo:params,craneId:this.state.id,rwStatus:'W'},this.showData);
    });
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
      bypass:{
        initialValue:this.state.params.bypass,
        valuePropName: 'checked'
      }
    };
    const {text,state,time,readLoading,writeLoading} = this.state;
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
            label='ByPass'
          >
            {getFieldDecorator('bypass',formRules.bypass)(
              <Switch checkedChildren={formatMessage({id:'app.device.open'})} unCheckedChildren={formatMessage({id:'app.device.close'})} />
            )}
          </FormItem>
        </Form>
      </div>
    )
  }
};
export default ByPass;
