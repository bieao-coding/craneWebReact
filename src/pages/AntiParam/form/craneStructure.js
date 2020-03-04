/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input,Select,message,Row,Col,Button } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {closeSocket,sendCmd} from "@/utils//websocket";
const FormItem = Form.Item;
const Option = Select.Option;
@connect(({}) => ({
}))
@Form.create()
class CraneStructure extends Component {
  state = {
    readLoading:false,
    writeLoading:false,
    text:'',
    state:0,
    time:'',
    params: {
      craneNum: null,//塔机编号
      craneType: 0,//塔机类型
      craneTypeNum: null,//塔机类型clone
      x: null,//工地坐标X(°)
      y: null,//工地坐标Y(°)
      length1: null,//起重臂(m)
      length2: null,//平衡臂(m)
      length3: null,//前拉杆距离
      height1: null,//塔机高(m)
      height2: null,//塔帽高
      height3: null,//配重下垂距离(m)
      height5: null,//钢丝绳下垂距离(m)
      height4: null,//前桥高(m)
      width1: null,//前桥宽(m)
      width2: null,//后桥宽(m)
      defaultAngleNum: null,// 默认角度(°)
      attachDefaultAngle: null,//默认角度(°)
      attachDefaultRadius: null, //默认幅度(m)
      attachDefaultHeight: null,//预留
      attachDummy3: null,//预留
      attachLength4: null,//标准节边长(m)
      attachHeight6: null,//标准节高度(m)
      maxLoad: null,//额定起重量(t)
      attachLength1_1: null,//动臂绞点
    }
  };
  // DOM加载完成后执行
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id},()=>{
        sendCmd({cmd:'CraneStructureExt',vo:{},craneId:this.state.id,rwStatus:'L'},this.showData)
      });
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.id !== currentState.id){
      this.setState({id:nextState.id},()=>{
        sendCmd({cmd:'CraneStructureExt',vo:{},craneId:this.state.id,rwStatus:'L'},this.showData)
      })
    }
  }
  /*接受返回值*/
  showData = (data) => {
    if(JSON.parse(data)){
      console.log(data);
      const res = JSON.parse(data);
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
  /*选择变化*/
  selectChange = (value) => {
    this.setState({
      params:{...this.state.params,...{craneType:value}}
    });
  };
  /*读取参数*/
  readParams = () =>{
    this.setState({readLoading:true});
    sendCmd({cmd:'CraneStructureExt',craneId:this.state.id,rwStatus:'R',vo:null},this.showData);
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
      const params = {...{...this.state.params,...{craneTypeNum:values.craneType,attachDefaultAngle:values.defaultAngleNum}},...values};
      delete params.readStatus;
      delete params.readTime;
      delete params.writeStatus;
      delete params.writeTime;
      delete params.insertTime;
      delete params.updateTime;
      delete params.initStatus;
      delete params.craneId;
      delete params.id;
      sendCmd({cmd:'CraneStructureExt',vo:params,craneId:this.state.id,rwStatus:'W'},this.showData);
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
      craneNum:{
        rules:[
          {required: true,validator:validateSelf(/^\d+$/,1,63)}
        ],
        initialValue:this.state.params.craneNum
      },
      craneType:{
        initialValue:this.state.params.craneType
      },
      x:{
        rules:[{required: true, pattern: new RegExp(/^(((-)?\d+(.\d+)?)|0)$/), message:formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.x
      },
      y:{
        rules:[{required: true, pattern: new RegExp(/^(((-)?\d+(.\d+)?)|0)$/), message:formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.y
      },
      length1:{
        rules:[{required: true,validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,200)}],
        initialValue:this.state.params.length1
      },
      length2:{
        rules:[{required: true,validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,40)}],
        initialValue:this.state.params.length2
      },
      height1:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,999)}],
        initialValue:this.state.params.height1
      },
      height2:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,30)}],
        initialValue:this.state.params.height2
      },
      defaultAngleNum:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,360)}],
        initialValue:this.state.params.defaultAngleNum
      },
      attachDefaultRadius:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,200)}],
        initialValue:this.state.params.attachDefaultRadius
      },
      height3:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.height3
      },
      height5:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.height5
      },
      height4:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.height4
      },
      width1:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.width1
      },
      width2:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.width2
      },
      attachLength4:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.attachLength4
      },
      attachHeight6:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,15)}],
        initialValue:this.state.params.attachHeight6
      },
      maxLoad:{
        initialValue:this.state.params.maxLoad
      },
      attachLength1_1:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,3)}],
        initialValue:this.state.params.attachLength1_1
      },
      length3:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,200)}],
        initialValue:this.state.params.length3
      },
    };
    const {text,state,time,params,readLoading,writeLoading} = this.state;
    const {craneType} = params;
    // 编辑赋值
    return (
      <div>
        <Row type="flex" align="middle" id = 'title'>
          <Col className='p-b-10'>
            <Button type="primary" icon="search" onClick={this.readParams} loading = {readLoading}><FormattedMessage id='app.device.read-params'/></Button>
            <Button type="primary" icon="save" disabled={!text} className='m-l-10 m-r-10' onClick={this.handleSubmit} loading = {writeLoading}><FormattedMessage id='app.device.set-params'/></Button>
            {/*<Button type="primary" icon="save" className='m-l-10 m-r-10' onClick={this.handleSubmit} loading = {writeLoading}><FormattedMessage id='app.device.set-params'/></Button>*/}
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
            label={formatMessage({id:'app.common.craneName'})}
          >
            {getFieldDecorator('craneNum', formRules.craneNum)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.craneType'})}
          >
            {getFieldDecorator('craneType', formRules.craneType)(
              <Select onChange={this.selectChange}>
                <Option value = {0}>{formatMessage({id:'app.common.flat-crane'})}</Option>
                <Option value = {1}>{formatMessage({id:'app.common.movable-crane'})}</Option>
                <Option value = {2}>{formatMessage({id:'app.common.head-crane'})}</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.x'})}
          >
            {getFieldDecorator('x', formRules.x)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.y'})}
          >
            {getFieldDecorator('y', formRules.y)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.length1'})}
          >
            {getFieldDecorator('length1', formRules.length1)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.length2'})}
          >
            {getFieldDecorator('length2', formRules.length2)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.height1'})}
          >
            {getFieldDecorator('height1', formRules.height1)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.height2'})}
            className={!craneType ? 'hide' : 'show'}
          >
            {getFieldDecorator('height2', formRules.height2)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.defaultAngleNum'})}
          >
            {getFieldDecorator('defaultAngleNum', formRules.defaultAngleNum)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.attachDefaultRadius'})}
          >
            {getFieldDecorator('attachDefaultRadius', formRules.attachDefaultRadius)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.height3'})}
          >
            {getFieldDecorator('height3', formRules.height3)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.height5'})}
            className={craneType === 1 ? 'hide' : 'show'}
          >
            {getFieldDecorator('height5', formRules.height5)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.height4'})}
          >
            {getFieldDecorator('height4', formRules.height4)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.width1'})}
          >
            {getFieldDecorator('width1', formRules.width1)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.width2'})}
          >
            {getFieldDecorator('width2', formRules.width2)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.attachLength4'})}
          >
            {getFieldDecorator('attachLength4', formRules.attachLength4)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.attachHeight6'})}
          >
            {getFieldDecorator('attachHeight6', formRules.attachHeight6)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.maxLoad'})}
          >
            {getFieldDecorator('maxLoad', formRules.maxLoad)(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.attachLength1_1'})}
            className={craneType === 1 ? 'show' : 'hide'}
          >
            {getFieldDecorator('attachLength1_1', formRules.attachLength1_1)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.length3'})}
            className={craneType === 2 ? 'show' : 'hide'}
          >
            {getFieldDecorator('length3', formRules.length3)(
              <Input />
            )}
          </FormItem>
        </Form>
      </div>
    )
  }
};
export default CraneStructure;
