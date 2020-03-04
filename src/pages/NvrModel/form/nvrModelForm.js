/*eslint-disable*/
import React, {Component, Fragment} from 'react';
import {Form, Input, Card, Button, Select} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
const FormItem = Form.Item;
const Option = Select.Option;
@connect(({ nvrModel, loading }) => ({
  nvrModel,
  loading: loading.effects['nvrModel/getEdit'],
}))
@Form.create()
class NvrModelForm extends Component {
  state = {
    loading:false,
    params:{
      nvrModelId:null,
      modelName:null,
      factoryId:null,
      nvrChannelCount:null
    },
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id},()=>{
        this.getEditData();
      });
    }
  }
  /*获取单项数据*/
  getEditData = () => {
    this.props.dispatch({
      type: 'nvrModel/getEdit',
      payload:this.state.id,
      callback:(data)=>{
        this.setState({params:data});
      }
    })
  };
  // /*保存*/
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({loading:true});
      this.props.dispatch({
        type: !!this.state.params.nvrModelId ? 'nvrModel/edit' : 'nvrModel/add',
        payload:{...this.state.params,...values},
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
  /*渲染*/
  render() {
    const { getFieldDecorator } = this.props.form;
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
      modelName:{
        rules:[{required: true,whitespace:true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.modelName
      },
      factoryId:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.factoryId
      },
      nvrChannelCount:{
        rules:[{required: true,pattern: new RegExp(/^[1-9](\d+)?$/), message:formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.nvrChannelCount
      }
    };
    // 编辑赋值
    return (
      <Card>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.modelName'})}
          >
            {getFieldDecorator('modelName', formRules.modelName)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.nvrFactory'})}
          >
            {getFieldDecorator('factoryId', formRules.factoryId)(
              <Select>
                <Option value = {0}><FormattedMessage id='app.nvr.haikang'/></Option>
                <Option value = {1}><FormattedMessage id='app.nvr.dahua'/></Option>
                <Option value = {2}><FormattedMessage id='app.nvr.yushi'/></Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.nvrChannelCount'})}
          >
            {getFieldDecorator('nvrChannelCount', formRules.nvrChannelCount)(
              <Input />
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout} className='m-b-0'>
            <Button type="primary" htmlType="submit" loading = {this.state.loading}>
              <FormattedMessage id='app.common.save' />
            </Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
};
export default NvrModelForm;
