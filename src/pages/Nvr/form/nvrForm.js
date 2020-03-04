/*eslint-disable*/
import React, {Component, Fragment} from 'react';
import { Form, Input,Card,Button,Select,message } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'

const FormItem = Form.Item;
const Option = Select.Option;
@connect(({ nvr, loading }) => ({
  nvr,
  loading: loading.effects['nvr/getEdit'],
}))
@Form.create()
class NvrForm extends Component {
  state = {
    loading:false,
    reloading:false,
    options:[],
    factoryId:null,
    params:{
      nvrId:null,
      nvrSn:null,
      nvrCode:null,
      nvrModelId:null
    },
    auth:{}
  };
  models = [];
  token = null;
  index1 = 0;
  AppKey = 'e2cba1a253ba4aa7a6d23293cea3bcd3';
  Secret = 'c2f27bf2abaae384e50ad12e7952b32d';
  // /*DOM加载完成后执行*/
  componentDidMount() {
    this.token = localStorage.getItem('token');
    const params = this.props.location.state;
    this.getModels();
    if(params && params.nvrId){
      this.setState({params:{...this.state.params,...{nvrId:params.nvrId}}},()=>{
        this.getEditData();
      });
    }
  }
  /*获取单项数据*/
  getEditData = () => {
    this.props.dispatch({
      type: 'nvr/getEdit',
      payload:this.state.params.nvrId,
      callback:(data)=>{
        this.setState({params:data});
      }
    })
  };
  /*获取nvr型号*/
  getModels(){
    this.props.dispatch({
      type: 'nvr/getNvrModels',
      payload:{queryType:1},
      callback:(data)=>{
        const newData = data.list.map((item)=>{
          const result = item.factoryId == 1 ? formatMessage({id:'app.nvr.dahua'}) : (item.factoryId == 2 ? formatMessage({id:'app.nvr.yushi'}):formatMessage({id:'app.nvr.haikang'}));
          return <Option key={item.nvrModelId} value={item.nvrModelId}>{`${item.modelName}(${result}-${item.nvrChannelCount})`}</Option>
        });
        this.setState({options:newData});
      }
    })
  }
  // /*保存*/
  handleSubmit = (e) => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({loading:true});
      const {params} = this.state;
      const newParams = {...params,...values};
      if(params.nvrId){
        this.save(newParams);
      }else{
        this.getToken(newParams);
      }
    });
  };
  /*重新绑定设备*/
  reBindingSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({reloading:true});
      const {params} = this.state;
      const newParams = {...params,...values};
      this.getToken(newParams);
    });
  };
  /*获取token*/
  getToken(params){
    const { dispatch } = this.props;
    if(!this.token){
      dispatch({
        type: 'nvr/getToken',
        payload:{appKey:this.AppKey,appSecret:this.Secret},
        callback:(res)=>{
          localStorage.setItem('token',res.data.accessToken);
          this.token = res.data.accessToken;
          this.addDevice(params);
        }
      });
    }else{
      this.addDevice(params);
    }
  }
  /*检查token过期*/
  checkToken(params){
    if(!this.index1){
      this.token = null;
      this.getToken(params);
      this.index1++;
    }else{
      this.setState({loading:false});
      message.error(formatMessage({id:'app.common.error'}));
    }
  }
  /*添加设备*/
  addDevice(params){
    this.props.dispatch({
      type: 'nvr/addDevice',
      payload:{accessToken:this.token,deviceSerial:params.nvrSn,validateCode:params.nvrCode},
      callback:(res)=>{
        if(res.code === '200' || res.code === '20017'){ // 2017已添加
          if(this.state.params.nvrId){
            this.setState({reloading:false});
            message.success(formatMessage({id:`app.nvr.${res.code}`}))
          }else{
            this.save(params);
          }
        }else if(res.code === '10002'){
          this.checkToken(params);
        }else{
          this.setState({loading:false,reloading:false});
          message.error(formatMessage({id:`app.nvr.${res.code}`}));
        }
      }
    });
  }
  /*保存*/
  save(params){
    this.props.dispatch({
      type: !!this.state.params.nvrId ? 'nvr/edit' : 'nvr/add',
      payload:params,
      callback:(res) => {
        resMessage(res);
        this.setState({loading:false});
        if(res && res.status === 'Success'){
          this.props.history.go(-1);
        }
      }
    })
  }
  filter = (inputValue, path) => {
    return path.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
  };
  /*渲染*/
  render() {
    const { getFieldDecorator } = this.props.form;
    const {options,params} = this.state;
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
      nvrSn:{
        rules:[{required: true,whitespace:true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.nvrSn
      },
      nvrCode:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.nvrCode
      },
      nvrModelId:{
        rules:[{required: true,message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.nvrModelId
      }
    };
    return (
      <Card>
        <Form>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.nvrSn'})}
          >
            {getFieldDecorator('nvrSn', formRules.nvrSn)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.nvrCode'})}
          >
            {getFieldDecorator('nvrCode', formRules.nvrCode)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.model'})}
          >
            {getFieldDecorator('nvrModelId', formRules.nvrModelId)(
              <Select placeholder={<FormattedMessage id='app.common.select' />} showSearch filterOption = {this.filter}>
                {options}
              </Select>
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout} className='m-b-0'>
            {
              params.nvrId ? (
                <Button type="primary" className='m-r-20' loading = {this.state.reloading} onClick={this.reBindingSubmit}>
                  <FormattedMessage id='app.common.reBinding' />
                </Button>
              ):(<Fragment></Fragment>)
            }
            <Button type="primary" loading = {this.state.loading} onClick={this.handleSubmit}>
              <FormattedMessage id='app.common.save' />
            </Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
};
export default NvrForm;
