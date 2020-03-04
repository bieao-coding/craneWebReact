/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input,Select,Row,Col,Button } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import router from "umi/router";
const FormItem = Form.Item;
const Option = Select.Option;
@connect(({}) => ({
}))
@Form.create()
class TowerGroupForm extends Component {
  state = {
    usedNum:[],
    params: {
      craneNumber: null,//塔机编号
      craneType: 0,//塔机类型
      isChange: 0,
      relative: 0,
      x: 0,//工地坐标X(°)
      y: 0,//工地坐标Y(°)
      l1: 1,//起重臂(m)
      l2: 0,//平衡臂(m)
      l3: 0,//前拉杆距离
      h1: 1,//塔机高(m)
      h2: 0,//塔帽高
      h3: 0,//配重下垂距离(m)
      h5: 0,//钢丝绳下垂距离(m)
      h4: 0,//前桥高(m)
      k1: 0,//前桥宽(m)
      k2: 0,//后桥宽(m)
      defaultAngle: 0,// 默认角度(°)
      defaultRadius: 0, //默认幅度(m)
      l4: 0,//标准节边长(m)
      h6: 1,//标准节高度(m)
    }
  };
  // DOM加载完成后执行
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      if(params.craneNumber){
        this.setState({params:params});
      }else{
        this.setState({usedNum:params.usedNum});
      }
      this.setState({id:params.id});
    }
  }
  /*选择变化*/
  selectChange = (value) => {
    this.setState({
      params:{...this.state.params,...{craneType:value}}
    });
  };
  /*设置参数*/
  save = (e) =>{
    this.setState({writeLoading:true});
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err){
        this.setState({writeLoading:false});
        return;
      };
      this.saveBefore(values);
      router.push({
        pathname:`/device/anti/param/layout/crane/set/towerGroup`,
        state:{id:this.state.id}
      });
    });
  };
  /*保存前处理*/
  saveBefore = (values) => {
    const {params} = this.state;
    let groups = JSON.parse(sessionStorage.getItem('towerGroup'));
    if(!!params.craneNumber){
      const newGroup = groups.map((item) => {
        if(item.craneNumber === values.craneNumber){
          return {...params,...values};
        }
        return item;
      });
      sessionStorage.setItem('towerGroup',JSON.stringify(newGroup));
    }else{
      groups.push({...values,...{isChange: 0,relative: 0}});
      sessionStorage.setItem('towerGroup',JSON.stringify(groups));
    }

  };
  /*渲染*/
  render() {
    const { getFieldDecorator } = this.props.form;
    const {usedNum} = this.state;
    const validateNum = (reg,min,max) => {
      return (rule,value,callback)=>{
        if(value < min || value > max || !new RegExp(reg).test(value) || usedNum.includes(value)){
          callback(formatMessage({id:'app.device.either-number'},{min:min,max:max,useNum:usedNum.join()}));
          return;
        }
        callback();
      }
    };
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
      craneNumber:{
        rules:[
          {required: true,validator:validateNum(/^\d+$/,1,63)}
        ],
        initialValue:this.state.params.craneNumber
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
      l1:{
        rules:[{required: true,validator:validateSelf(/^((\d+(.\d+)?)|0)$/,1,200)}],
        initialValue:this.state.params.l1
      },
      l2:{
        rules:[{required: true,validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,40)}],
        initialValue:this.state.params.l2
      },
      h1:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,1,999)}],
        initialValue:this.state.params.h1
      },
      h2:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,30)}],
        initialValue:this.state.params.h2
      },
      defaultAngle:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,360)}],
        initialValue:this.state.params.defaultAngle
      },
      defaultRadius:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,200)}],
        initialValue:this.state.params.defaultRadius
      },
      h3:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.h3
      },
      h5:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.h5
      },
      h4:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.h4
      },
      k1:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.k1
      },
      k2:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.k2
      },
      l4:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,10)}],
        initialValue:this.state.params.l4
      },
      h6:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,1,15)}],
        initialValue:this.state.params.h6
      },
      l3:{
        rules:[{required: true, validator:validateSelf(/^((\d+(.\d+)?)|0)$/,0,200)}],
        initialValue:this.state.params.l3
      },
    };
    const {craneNumber,craneType} = this.state.params;
    // 编辑赋值
    return (
      <div className='all-height'>
        <Row type="flex" align="middle" id = 'title'>
          <Col className='p-b-10'>
            <Button type="primary" icon="save" onClick={this.save}>
              <FormattedMessage id='app.common.save'/>
            </Button>
          </Col>
        </Row>
        <Form onSubmit={this.save}>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.craneName'})}
          >
            {getFieldDecorator('craneNumber', formRules.craneNumber)(
              <Input disabled={!!craneNumber}/>
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
            {getFieldDecorator('l1', formRules.l1)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.length2'})}
          >
            {getFieldDecorator('l2', formRules.l2)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.height1'})}
          >
            {getFieldDecorator('h1', formRules.h1)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.height2'})}
            className={!craneType ? 'hide' : 'show'}
          >
            {getFieldDecorator('h2', formRules.h2)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.defaultAngleNum'})}
          >
            {getFieldDecorator('defaultAngle', formRules.defaultAngle)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.attachDefaultRadius'})}
          >
            {getFieldDecorator('defaultRadius', formRules.defaultRadius)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.height3'})}
          >
            {getFieldDecorator('h3', formRules.h3)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.height5'})}
            className={craneType === 1 ? 'hide' : 'show'}
          >
            {getFieldDecorator('h5', formRules.h5)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.height4'})}
          >
            {getFieldDecorator('h4', formRules.h4)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.width1'})}
          >
            {getFieldDecorator('k1', formRules.k1)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.width2'})}
          >
            {getFieldDecorator('k2', formRules.k2)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.attachLength4'})}
          >
            {getFieldDecorator('l4', formRules.l4)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.attachHeight6'})}
          >
            {getFieldDecorator('h6', formRules.h6)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.device.length3'})}
            className={craneType === 2 ? 'show' : 'hide'}
          >
            {getFieldDecorator('l3', formRules.l3)(
              <Input />
            )}
          </FormItem>
        </Form>
      </div>
    )
  }
};
export default TowerGroupForm;
