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
class CraneAlarmAndWarning extends Component {
  state = {
    readLoading:false,
    writeLoading:false,
    text:'',
    state:0,
    time:'',
    params:{
      inWarning:null,//塔机内限位预警
      inAlarm:null, //塔机内限位报警
      outWarning:null,//塔机外限位预警
      outAlarm:null,//塔机外限位报警
      upWarning:null,//塔机上限位预警
      upAlarm:null,//塔机上限位报警
      downWarning:null,// 塔机下限位预警
      downAlarm:null,// 塔机下限位报警
      corotationWarning:null,//塔机正转预警
      corotationAlarm:null,//塔机正转报警
      reverseWarning:null,// 塔机反转预警
      reverseAlarm:null,
    }
  };
  // DOM加载完成后执行
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id},()=>{
        sendCmd({cmd:'CraneStop',vo:{},craneId:this.state.id,rwStatus:'L'},this.showData)
      });
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.id !== currentState.id){
      this.setState({id:nextState.id},()=>{
        sendCmd({cmd:'CraneStop',vo:{},craneId:this.state.id,rwStatus:'L'},this.showData)
      })
    }
  }
  /*接受返回值*/
  showData = (data) => {
    if(JSON.parse(data)){
      const res = JSON.parse(data);
      console.log(data)
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
        this.setState({params:res.vo,readLoading:false,writeLoading:false});
      }else{
        message.error(res.message);
        this.setState({text:'',state:0,time:'',readLoading:false,writeLoading:false});
      }
    }
  };
  /*读取参数*/
  readParams = () =>{
    this.setState({readLoading:true});
    sendCmd({cmd:'CraneStop',vo:{},craneId:this.state.id,rwStatus:'R'},this.showData);
  };
  /*设置参数*/
  handleSubmit = (e) =>{
    this.setState({writeLoading:true});
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err){
        this.setState({writeLoading:false});
        return;
      };
      const params = {...this.state.params,...values};
      delete params.readStatus;
      delete params.readTime;
      delete params.writeStatus;
      delete params.writeTime;
      delete params.insertTime;
      delete params.updateTime;
      delete params.initStatus;
      delete params.craneId;
      delete params.id;
      sendCmd({cmd:'CraneStop',vo:params,craneId:this.state.id,rwStatus:'W'},this.showData);
    });
  };
  /*渲染*/
  render() {
    const { getFieldDecorator } = this.props.form;
    const validateSelf = (reg,min,max) => {
      return (rule,value,callback)=>{
        if(value < min || value > max || !new RegExp(reg).test(value)){
          callback(formatMessage({id:'app.device.valid-number'},{min:min,max:max}));
          return;
        }
        callback();
      }
    };
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
      inWarning:{
        rules:[{required: true,validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,90)}],
        initialValue:this.state.params.inWarning
      },
      inAlarm:{
        rules:[{required: true,validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,90)}],
        initialValue:this.state.params.inAlarm
      },
      outWarning:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,20)}],
        initialValue:this.state.params.outWarning
      },
      outAlarm:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,20)}],
        initialValue:this.state.params.outAlarm
      },
      upWarning:{
        rules:[{required: true, pattern: new RegExp(/^(((-)?\d+(.\d+)?)|0)$/), message:formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.upWarning
      },
      upAlarm:{
        rules:[{required: true,pattern: new RegExp(/^(((-)?\d+(.\d+)?)|0)$/), message:formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.upAlarm
      },
      downWarning:{
        rules:[{required: true, pattern: new RegExp(/^(((-)?\d+(.\d+)?)|0)$/), message:formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.downWarning
      },
      downAlarm:{
        rules:[{required: true, pattern: new RegExp(/^(((-)?\d+(.\d+)?)|0)$/), message:formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.downAlarm
      },
      corotationWarning:{
        rules:[{required: true, pattern: new RegExp(/^(((-)?\d+(.\d+)?)|0)$/), message:formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.corotationWarning
      },
      corotationAlarm:{
        rules:[{required: true, pattern: new RegExp(/^(((-)?\d+(.\d+)?)|0)$/), message:formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.corotationAlarm
      },
      reverseWarning:{
        rules:[{required: true, pattern: new RegExp(/^(((-)?\d+(.\d+)?)|0)$/), message:formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.reverseWarning
      },
      reverseAlarm:{
        rules:[{required: true, pattern: new RegExp(/^(((-)?\d+(.\d+)?)|0)$/), message:formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.reverseAlarm
      }
    };
    const {text,state,time,readLoading,writeLoading} = this.state;
    return (
      <div className='all-height'>
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
            label={formatMessage({id:'app.device.inWarning'})}
          >
            {getFieldDecorator('inWarning', formRules.inWarning)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.inAlarm'})}
          >
            {getFieldDecorator('inAlarm', formRules.inAlarm)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.outWarning'})}
          >
            {getFieldDecorator('outWarning', formRules.outWarning)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.outAlarm'})}
          >
            {getFieldDecorator('outAlarm', formRules.outAlarm)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.upWarning'})}
          >
            {getFieldDecorator('upWarning', formRules.upWarning)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.upAlarm'})}
          >
            {getFieldDecorator('upAlarm', formRules.upAlarm)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.downWarning'})}
          >
            {getFieldDecorator('downWarning', formRules.downWarning)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.downAlarm'})}
          >
            {getFieldDecorator('downAlarm', formRules.downAlarm)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.corotationWarning'})}
          >
            {getFieldDecorator('corotationWarning', formRules.corotationWarning)(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.corotationAlarm'})}
          >
            {getFieldDecorator('corotationAlarm', formRules.corotationAlarm)(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.reverseWarning'})}
          >
            {getFieldDecorator('reverseWarning', formRules.reverseWarning)(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.reverseAlarm'})}
          >
            {getFieldDecorator('reverseAlarm', formRules.reverseAlarm)(
              <Input disabled/>
            )}
          </FormItem>
        </Form>
      </div>
    )
  }
};
export default CraneAlarmAndWarning;
