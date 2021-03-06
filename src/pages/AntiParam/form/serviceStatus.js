/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input,Card,Button,Row,Col,Switch,message } from 'antd';
import {connect} from "dva/index";
import { formatMessage, FormattedMessage } from 'umi/locale';
import {closeSocket,sendCmd} from "@/utils/websocket";
const FormItem = Form.Item;
@connect(({}) => ({
}))
@Form.create()
class ServiceStatus extends Component {
  state = {
    readLoading:false,
    writeLoading:false,
    text:'',
    state:0,
    time:'',
    params:{
      maintenanceStatus:null,//维护状态
    }
  };
  /*改变事件*/
  onChange = (checked) => {
    this.setState({params:{maintenanceStatus:checked}})
  };
  // DOM加载完成后执行
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id},()=>{
        sendCmd({cmd:'Maintenance',"vo":{},craneId:this.state.id,rwStatus:'L'},this.showData)
      });
    }
  }
   /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.id !== currentState.id){
      this.setState({id:nextState.id},()=>{
        sendCmd({cmd:'Maintenance',"vo":{},craneId:this.state.id,rwStatus:'L'},this.showData)
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
          }
        }else{
          this.setState({text:'',state:0,time:''});
        }
        this.props.form.resetFields();
        this.setState({params:{maintenanceStatus:Boolean(res.vo.maintenanceStatus)},readLoading:false,writeLoading:false});
      }else{
        message.error(res.message);
        this.setState({text:'',state:0,time:'',readLoading:false,writeLoading:false});
      }
    }
  };
  /*读取参数*/
  readParams = () =>{
    this.setState({readLoading:true});
    sendCmd({cmd:'Maintenance',craneId:this.state.id,rwStatus:'R'},this.showData);
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
      sendCmd({cmd:'Maintenance',vo:{maintenanceStatus:Number(this.state.params.maintenanceStatus)},craneId:this.state.id,rwStatus:'W'},this.showData);
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
      maintenanceStatus:{
        initialValue:this.state.params.maintenanceStatus
      }
    };
    const {text,state,time,params,readLoading,writeLoading} = this.state;
    return (
      <div>
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
            label="维护状态"
          >
            {getFieldDecorator('maintenanceStatus')(
              <Switch checkedChildren={formatMessage({id:'app.device.open'})} unCheckedChildren={formatMessage({id:'app.device.close'})} onChange={this.onChange} checked={params.maintenanceStatus} />
            )}
          </FormItem>
        </Form>
      </div>
    )
  }
};
export default ServiceStatus;
