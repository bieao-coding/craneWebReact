/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input,Card,Button,Row,Col,message } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
import {closeSocket,sendCmd} from "@/utils/websocket";
const FormItem = Form.Item;
@connect(({}) => ({
}))
@Form.create()
class MasterVersion extends Component {
  state = {
    readLoading:false,
    writeLoading:false,
    text:'',
    state:0,
    time:'',
    params:{
      softwareVersion:null,//软件版本
      softwareVersionEx:null,//扩展版本
      hardwareVersion:null,//硬件版本
      hardwareVersionEx:null,//硬件版本扩展
    }
  };
  // DOM加载完成后执行
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id},()=>{
        sendCmd({cmd:'SystemInfo',"vo":{},craneId:this.state.id,rwStatus:'L'},this.showData)
      });
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
          }
        }else{
          this.setState({text:'',state:0,time:''});
        }
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
    sendCmd({cmd:'SystemInfo',craneId:this.state.id,rwStatus:'R'},this.showData);
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
      softwareVersion:{
        initialValue:this.state.params.softwareVersion
      },
      softwareVersionEx:{
        initialValue:this.state.params.softwareVersionEx
      },
      hardwareVersion:{
        initialValue:this.state.params.hardwareVersion
      },
      hardwareVersionEx:{
        initialValue:this.state.params.hardwareVersionEx
      },
    };
    const {text,state,time,readLoading} = this.state;
    return (
      <div className='all-height'>
        <Row type="flex" align="middle" id='title'>
          <Col className='p-b-10'>
            <Button type="primary" className='m-r-10' icon="search" onClick={this.readParams} loading = {readLoading}><FormattedMessage id='app.device.read-params'/></Button>
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
        <Form>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.softVersion'})}
          >
            {getFieldDecorator('softwareVersion', formRules.softwareVersion)(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.softwareVersionEx'})}
          >
            {getFieldDecorator('softwareVersionEx', formRules.softwareVersionEx)(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.hardwareVersion'})}
          >
            {getFieldDecorator('hardwareVersion', formRules.hardwareVersion)(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.hardwareVersionEx'})}
          >
            {getFieldDecorator('hardwareVersionEx', formRules.hardwareVersionEx)(
              <Input disabled/>
            )}
          </FormItem>
        </Form>
      </div>
    )
  }
};
export default MasterVersion;
