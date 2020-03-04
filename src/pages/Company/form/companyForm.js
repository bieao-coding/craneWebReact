/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { Form, Input,Card,Button } from 'antd';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
import { formatMessage, FormattedMessage } from 'umi/locale';
import info from '@/defaultInfo';
const FormItem = Form.Item;
const {TextArea}  = Input;
@connect(({ role, loading }) => ({
  role,
  loading: loading.effects['role/getEdit'],
}))
@Form.create()
class CompanyForm extends Component {
  state = {
    loading:false,
    params:{
      companyId:null,
      companyName:null,
      businessType:null,
      businessLevel:null,
      parentCompanyId:null,
      manager:null,
      telephone:null,
      remark:null
    }
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const location = this.props.location.state;
    const {params} = this.state;
    if(!!location){
      if(location.parentId !== undefined){
        this.setState({params:{...params,...{parentCompanyId:location.parentId,businessType:location.businessType,businessLevel:location.businessLevel}}});
      }
      if(location.companyId){
        this.setState({id:location.companyId,businessType:location.businessType},()=>{
          this.getEditData();
        })
      }
    }
  }
  /*获取单项数据*/
  getEditData = () => {
    this.props.dispatch({
      type: 'company/getEdit',
      payload:{id:this.state.id,businessType:this.state.businessType},
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
      const {params} = this.state;
      this.props.dispatch({
        type: !!params.companyId ? 'company/edit' : 'company/add',
        payload:{...params,...values},
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
      companyName:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.companyName
      },
      manager:{
        initialValue:this.state.params.manager
      },
      telephone:{
        rules:[{pattern:info.isSingapore ? new RegExp(/^\+65\d{8}$/):new RegExp(/(^(1[3-9][0-9])\d{8}$)|(^(0\d{2}-\d{8}(-\d{1,4})?)|(0\d{3}-\d{7,8}(-\d{1,4})?)$)/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.telephone
      },
      remark:{
        initialValue:this.state.params.remark
      },
    };
    // 编辑赋值
    return (
      <div>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.common.companyName' />}
          >
            {getFieldDecorator('companyName', formRules.companyName)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.company.manager' />}
          >
            {getFieldDecorator('manager', formRules.manager)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.common.phone' />}
          >
            {getFieldDecorator('telephone', formRules.telephone)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.common.remark' />}
          >
            {getFieldDecorator('remark', formRules.remark)(
              <TextArea rows={3}/>
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout} className='m-b-0'>
            {!!this.props.location.state ? (
              <Button type="primary" htmlType="submit" loading = {this.state.loading}>
                <FormattedMessage id='app.common.save' />
              </Button>
            ):(<Fragment></Fragment>)
            }
          </FormItem>
        </Form>
      </div>
    )
  }
};
export default CompanyForm;
