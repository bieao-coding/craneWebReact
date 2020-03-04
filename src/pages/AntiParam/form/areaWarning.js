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
class AreaWarning extends Component {
  state = {
    readLoading:false,
    writeLoading:false,
    text:'',
    state:0,
    time:'',
    params:{
      slewWarning3:null,//转动三速（弧长m）1
      slewWarning:null, //转动二速（弧长m）1
      slewAlarm:null,//转动一速（弧长m）1
      minSlewWarning:null,//停车角弧长
      breakSlewWarning:null,//刹车角（弧长m）1
      breakDelay:null,// 刹车时间（s）1
      radiusWarning:null,//幅度高速（m）1
      radiusAlarm:null,// 幅度低速（m）1
      minSlewSpeed:null,//停车速度（°/s）1
      moveAreaWarning:null,//转角三速(°)(不用)
      moveAreaAlarm:null,//塔机区域移动报警(不用)
      slewAreaWarning:null,//转角二速(°)(不用)
      slewAreaAlarm:null,//转角一速(°)(不用)
      radiusAreaWarning:null,//幅度高速(m)(不用)
      radiusAreaAlarm:null,//幅度低速(m)(不用)
      antiSlewSpeed:null,//防碰撞转角速度(不用)
      radiusWarning3:null,//幅度预警3速(不用)
      moveWarning:null,//塔机移动预警(不用)
      moveAlarm:null,// 塔机移动报警(不用)
      dummy1:null,
      dummy2:null,
      dummy3:null,
      dummy4:null,
      dummy5:null,
      dummy6:null,
    }
  };
  // DOM加载完成后执行
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id},()=>{
        sendCmd({cmd:'ExtAntiCollision',"vo":{},craneId:this.state.id,rwStatus:'L'},this.showData)
      });
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.id !== currentState.id){
      this.setState({id:nextState.id},()=>{
         sendCmd({cmd:'ExtAntiCollision',"vo":{},craneId:this.state.id,rwStatus:'L'},this.showData)
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
  /*读取参数*/
  readParams = () =>{
    this.setState({readLoading:true});
    sendCmd({cmd:'ExtAntiCollision',craneId:this.state.id,rwStatus:'R'},this.showData);
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
      sendCmd({cmd:'ExtAntiCollision',vo:params,craneId:this.state.id,rwStatus:'W'},this.showData);
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
      moveAreaWarning:{
        rules:[{required: true,validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,50)}],
        initialValue:this.state.params.moveAreaWarning
      },
      slewAreaWarning:{
        rules:[{required: true,validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,50)}],
        initialValue:this.state.params.slewAreaWarning
      },
      slewAreaAlarm:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,50)}],
        initialValue:this.state.params.slewAreaAlarm
      },
      radiusAreaWarning:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.radiusAreaWarning
      },
      radiusAreaAlarm:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.radiusAreaAlarm
      },
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
            label={formatMessage({id:'app.device.moveAreaWarning'})}
          >
            {getFieldDecorator('moveAreaWarning', formRules.moveAreaWarning)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.slewAreaWarning'})}
          >
            {getFieldDecorator('slewAreaWarning', formRules.slewAreaWarning)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.slewAreaAlarm'})}
          >
            {getFieldDecorator('slewAreaAlarm', formRules.slewAreaAlarm)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.radiusAreaWarning'})}
          >
            {getFieldDecorator('radiusAreaWarning', formRules.radiusAreaWarning)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.radiusAreaAlarm'})}
          >
            {getFieldDecorator('radiusAreaAlarm', formRules.radiusAreaAlarm)(
              <Input />
            )}
          </FormItem>
        </Form>
      </div>
    )
  }
};
export default AreaWarning;
