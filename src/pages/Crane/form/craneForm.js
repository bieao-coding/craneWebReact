/*eslint-disable*/
import React, { Component } from 'react';
import {Form, Input, Card, Button, Select, DatePicker, Upload, Icon, message, Cascader} from 'antd';
import {connect} from "dva/index";
import {resMessage,transPingTreeToChildren,recursionTopToKey} from '@/utils/utils'
import { formatMessage, FormattedMessage } from 'umi/locale';
import moment from 'moment';
const FormItem = Form.Item;
const Option = Select.Option;
const {TextArea}  = Input;
const dateFormat = 'YYYY-MM-DD';
@connect(({ crane, loading }) => ({
  crane,
  loading: loading.effects['crane/getEdit'],
}))
@Form.create()
class CraneForm extends Component {
  state = {
    loading:false,
    fileList:[],
    propertyCompanies:[],
    antiSn:[],
    videoSn:[],
    factories:[],
    models:[],
    params:{
      projectId:null,
      craneId:null,
      craneNumber:'',
      sn:null,
      videoSn:null,
      simNumber:null,
      factoryId:null,
      modelId:null,
      propertyCompanyId:null,
      prodDate:new moment(),
      craneAlias:null,
      craneSn:null,
      remarks:null,
    },
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    this.getProperty();
    this.getAllAntis();
    this.getAllVideos();
    this.getAllFactories();
    if(params){
      if(params.projectId){
        this.setState({params:{...this.state.params,...{projectId:params.projectId}}});
        if(params.craneId){
          this.setState({id:params.craneId},()=>{
            this.getEditData();
          });
        }
      }
    }
  }
  /*获取单项数据*/
  getEditData = () => {
    this.props.dispatch({
      type: 'crane/getEdit',
      payload:this.state.id,
      callback:(data)=>{
        const {propertyCompanies} = this.state;
        const prodDate = data.prodDate ? moment(data.prodDate, dateFormat) : new moment();
        const array = !!data.propertyCompanyId ? recursionTopToKey(propertyCompanies,'companyId','companyId',data.propertyCompanyId).reverse() : null;
        const params = {...data,...{prodDate:prodDate,propertyCompanyId:array}};
        this.getAllModels(params.factoryId);
        this.setState({params:params});
      }
    })
  };
  /*获取所有防碰撞Sn*/
  getAllAntis = () => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'crane/getAntiList',
      payload:{queryType:1},
      callback:(res)=>{
        res && this.resolveSelect(res,'sn','sn','antiSn');
      }
    })
  };
  /*获取所有防碰撞Sn*/
  getAllVideos = () => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'crane/getVideoList',
      payload:{queryType:1},
      callback:(res)=>{
        res && this.resolveSelect(res,'sn','sn','videoSn');
      }
    })
  };
  /*获取所有厂商*/
  getAllFactories = () => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'crane/getFactoryList',
      payload:{queryType:1},
      callback:(res)=>{
        res && this.resolveSelect(res.list,'craneFactoryId','craneFactoryName','factories');
      }
    })
  };
  /*获取所有型号*/
  getAllModels = (factoryId) => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'crane/getModelList',
      payload:{craneFactoryId:factoryId,queryType:1},
      callback:(res)=>{
        res && this.resolveSelect(res.list,'craneModelId','craneModelName','models');
      }
    })
  };
  /*获取产权单位*/
  getProperty(){
    const {dispatch}  =this.props;
    dispatch({
      type: 'crane/getProperty',
      payload:{businessType:4},
      callback:(res)=>{
        const list = transPingTreeToChildren({id:'companyId',pid:'parentCompanyId',children:'children'},res,{name:['value','label'],value:['companyId','companyName']});
        this.setState({propertyCompanies:list});
      }
    })
  }
  resolveSelect = (list,id,name,key) => {
    const options = list.map((item)=>{
      return <Option value={item[id]}  key={item[id]}>{item[name]}</Option>
    });
    if(id === 'sn') options.unshift(<Option value = {null}  key = {null}>--</Option>);
    this.setState({[key]:options});
  };
  // /*保存*/
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({loading:true});
      const prodDate = values.prodDate ? moment(values.prodDate).format('YYYY-MM-DD HH:mm:ss') : null;
      const propertyCompanyId = values.propertyCompanyId ? values.propertyCompanyId[values.propertyCompanyId.length - 1] : null;
      let params = {...this.state.params,...values,...{prodDate,propertyCompanyId}};
      this.props.dispatch({
        type: !!this.state.params.craneId ? 'crane/edit' : 'crane/add',
        payload:params,
        callback:(res) => {
          resMessage(res);
          this.setState({loading:false});
          if(res && res.status === 'Success'){
            this.props.history.go(-1);
          }
        }
      })
    });
  };
  /*厂商选择*/
  onFactoryChange = (value) => {
    this.props.form.setFieldsValue({modelId:null});
    this.getAllModels(value);
  };
  filter = (inputValue, path) => {
    return path.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
  };
  /*渲染*/
  render() {
    const { getFieldDecorator } = this.props.form;
    const validateSelf = () => {
      return (rule,value,callback)=>{
        const regOne = /^TC([1-9][0-9]?){1,2}$/;
        const num = !!value.match(/\d+/) ? parseInt(value.match(/\d+/)[0]) : 0;
        if(!regOne.test(value) || (num < 1 || num > 63)){
          callback(formatMessage({id:'app.crane.check-number'}));
          return;
        }
        callback();
      }
    };
    //自适应
    const formItemLayout = {
      labelCol: {
        sm: { span: 8 },
        md: { span: 8 },
        xl: { span: 8 }
      },
      wrapperCol: {
        sm: { span: 12 },
        md: { span: 12 },
        xl: { span: 8 }
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
    // 验证规则
    const formRules = {
      craneNumber:{
        rules:[{required: true,validator:validateSelf()}],
        initialValue:this.state.params.craneNumber
      },
      craneAlias:{
        initialValue:this.state.params.craneAlias
      },
      craneSn:{
        initialValue:this.state.params.craneSn
      },
      simNumber:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.simNumber
      },
      sn:{
        initialValue:this.state.params.sn
      },
      videoSn:{
        initialValue:this.state.params.videoSn
      },
      factoryId:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.factoryId
      },
      modelId:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.modelId
      },
      propertyCompanyId:{
        initialValue:this.state.params.propertyCompanyId
      },
      prodDate:{
        initialValue:this.state.params.prodDate
      },
      remarks:{
        initialValue:this.state.params.remarks
      }
    };
    const {propertyCompanies,antiSn,videoSn,factories,models,params}  = this.state;
    return (
      <div>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.craneName'})}
          >
            {getFieldDecorator('craneNumber', formRules.craneNumber)(
              <Input disabled={!!params.craneId}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.crane.craneAlias'})}
          >
            {getFieldDecorator('craneAlias', formRules.craneAlias)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.crane.simNumber'})}
          >
            {getFieldDecorator('simNumber', formRules.simNumber)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.crane.anti-sn'})}
          >
            {getFieldDecorator('sn', formRules.sn)(
              <Select showSearch placeholder="请选择">{antiSn}</Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.crane.video-sn'})}
          >
            {getFieldDecorator('videoSn', formRules.videoSn)(
              <Select showSearch placeholder="请选择">{videoSn}</Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.crane.factory'})}
          >
            {getFieldDecorator('factoryId', formRules.factoryId)(
              <Select showSearch filterOption = {this.filter} placeholder={formatMessage({id:'app.common.select'})} onChange={this.onFactoryChange}>{factories}</Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.crane.model'})}
          >
            {getFieldDecorator('modelId', formRules.modelId)(
              <Select showSearch filterOption = {this.filter} placeholder={formatMessage({id:'app.common.select'})}>{models}</Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.crane.property'})}
          >
            {getFieldDecorator('propertyCompanyId', formRules.propertyCompanyId)(
              <Cascader disabled={!!params.propertyCompanyId} options={propertyCompanies} placeholder={formatMessage({id:'app.common.select'})} showSearch={this.filter}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.crane.craneSn'})}
          >
            {getFieldDecorator('craneSn', formRules.craneSn)(
              <Input disabled={!!params.craneSn}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.crane.prodDate'})}
          >
            {getFieldDecorator('prodDate', formRules.prodDate)(
              <DatePicker allowClear={false}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.remark'})}
          >
            {getFieldDecorator('remarks', formRules.remarks)(
              <TextArea rows={3}/>
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout} className='m-b-0'>
            <Button type="primary" htmlType="submit" loading = {this.state.loading}>
              <FormattedMessage id='app.common.save' />
            </Button>
          </FormItem>
        </Form>
      </div>
    )
  }
};
export default CraneForm;
