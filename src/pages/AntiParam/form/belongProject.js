/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input,Card,Button,Row,Col,message,Select } from 'antd';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
import {closeSocket,sendCmd} from "@/utils//websocket";
const FormItem = Form.Item;
const Option = Select.Option;
@connect(({}) => ({
}))
@Form.create()
class BelongProject extends Component {
  state = {
    readLoading:false,
    writeLoading:false,
    text:'',
    state:0,
    time:'',
    models:null,
    params: {
      projectName: null,//工程名称
      projectAdd: null,//工程地址
      craneModel: null,//塔机型号
    }
  };
  // DOM加载完成后执行
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id},()=>{
        sendCmd({cmd:'ProjectInfo',"vo":{},craneId:this.state.id,rwStatus:'L'},this.showData)
      });
    }
  }
   /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.id !== currentState.id){
      this.setState({id:nextState.id},()=>{
         sendCmd({cmd:'ProjectInfo',"vo":{},craneId:this.state.id,rwStatus:'L'},this.showData)
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
              this.setState({text:'读取',state:1,time:res.vo.readTime});
              message.success('读取成功！');
            }else{
              this.setState({text:'读取',state:0,time:''});
              message.error('读取失败！');
            }
          }else if(res.rwStatus === 'W'){
            if(res.vo.writeStatus === 'Success'){
              this.setState({text:'设置',state:1,time:res.vo.writeTime});
              message.success('设置成功！');
            }else{
              this.setState({text:'设置',state:0,time:''});
              message.error('设置失败！');
            }
          }else{
            this.setOptions(res.vo.models);
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
  /*填写select*/
  setOptions = (data) => {
    const options = data.map(item => <Option key = {item.craneModelId.toString()}>{item.craneModelName}</Option>);
    this.setState({models:options});
  };
  /*选择变化*/
  selectChange = (value) => {
    this.setState({
      params:{...this.state.params,...{craneModel:value}}
    });
  };
  /*读取参数*/
  readParams = () =>{
    this.setState({readLoading:true});
    sendCmd({cmd:'ProjectInfo',craneId:this.state.id,rwStatus:'R'},this.showData);
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
      delete params.models;
      delete params.projectContact;
      delete params.contactPhone;
      sendCmd({cmd:'ProjectInfo',vo:params,craneId:this.state.id,rwStatus:'W'},this.showData);
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
      projectName:{
        rules:[{required: true,message:'请输入必填项'}],
        initialValue:this.state.params.projectName
      },
      projectAdd:{
        rules:[{required: true,message:'请输入必填项'}],
        initialValue:this.state.params.projectAdd
      },
      craneModel:{
        initialValue:this.state.params.craneModel
      },
    };
    const {text,state,time,models,readLoading,writeLoading} = this.state;
    return (
      <div className='all-height'>
        <Row type="flex" align="middle" id = 'title'>
          <Col className='p-b-10'>
            <Button type="primary" icon="search" onClick={this.readParams} loading = {readLoading}>读取参数</Button>
            <Button type="primary" icon="save" disabled={!text} className='m-l-10 m-r-10' onClick={this.handleSubmit} loading = {writeLoading}>设置参数</Button>
          </Col>
          <Col xl={15} md={24} className={!!text ? 'show p-b-10 title-style':'hide p-b-10 title-style'}>
            <Row type="flex" align = 'middle'>
              <span className='m-r-10'>
                <span>{text}状态：</span>
                <span className={ state ? 'success-color' : 'default-color'}>{state ? '成功' : '失败'}</span>
              </span>
              <span className={state ? 'show':'hide'}>
                <span>{text}时间：</span>
                <span className={ state ? 'success-color' : 'default-color'}>{state ? time : ''}</span>
              </span>
            </Row>
          </Col>
        </Row>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label="工程名称"
          >
            {getFieldDecorator('projectName', formRules.projectName)(
              <Input />
            )}
          </FormItem>
          <FormItem
          {...formItemLayout}
          label="工程地址"
        >
          {getFieldDecorator('projectAdd', formRules.projectAdd)(
            <Input />
          )}
        </FormItem>
          <FormItem
            {...formItemLayout}
            label="塔机型号"
          >
            {getFieldDecorator('craneModel', formRules.craneModel)(
              <Select onChange={this.selectChange}>
                {models}
              </Select>
            )}
          </FormItem>
        </Form>
      </div>
    )
  }
};
export default BelongProject;
