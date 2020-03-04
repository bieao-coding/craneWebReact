/*eslint-disable*/
import React, {Component, Fragment} from 'react';
import { Form, Input,Card,Button } from 'antd';
import {connect} from "dva/index";
import { formatMessage, FormattedMessage } from 'umi/locale';
import {resMessage} from '@/utils/utils'
const FormItem = Form.Item;
const {TextArea}  = Input;
@connect(({ contactPerson, loading }) => ({
  contactPerson,
  loading: loading.effects['contactPerson/getEdit'],
}))
@Form.create()
class ContactPersonForm extends Component {
  state = {
    loading:false,
    params:{
      contactId:null,
      contactName:null,
      contactMobile:null,
      contactEmail:null,
      contactTitle:null,
      contactOrganization:null,
      remark:null,
    }
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.contactId){
      this.setState({id:params.contactId},()=>{
        this.getEditData();
      });
    }
  }
  /*获取单项数据*/
  getEditData = () => {
    this.props.dispatch({
      type: 'contactPerson/getEdit',
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
        type: !!this.state.params.contactId ? 'contactPerson/edit' : 'contactPerson/add',
        payload:{...this.state.params,...values,...{contactMobile:`+65${values.contactMobile}`}},
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
      contactName:{
        rules:[{required: true,whitespace:true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.contactName
      },
      contactMobile:{
        rules:[{required: true,pattern:new RegExp(/^\d{8}$/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.contactMobile
      },
      contactEmail:{
        rules:[{pattern:new RegExp(/^[a-z\d]+(\.[a-z\d]+)*@([\da-z](-[\da-z])?)+(\.{1,2}[a-z]+)+$/), message: formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.contactEmail
      },
      contactTitle:{
        initialValue:this.state.params.contactTitle
      },
      contactOrganization:{
        initialValue:this.state.params.contactOrganization
      },
      remark:{
        initialValue:this.state.params.remark
      }
    };
    // 编辑赋值
    return (
      <Card>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.contact.contactName' />}
          >
            {getFieldDecorator('contactName', formRules.contactName)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.contact.contactMobile' />}
          >
            {getFieldDecorator('contactMobile', formRules.contactMobile)(
              <Input addonBefore="+65"/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.contact.contactEmail' />}
          >
            {getFieldDecorator('contactEmail', formRules.contactEmail)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.contact.contactTitle' />}
          >
            {getFieldDecorator('contactTitle', formRules.contactTitle)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.contact.contactOrganization' />}
          >
            {getFieldDecorator('contactOrganization', formRules.contactOrganization)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.common.description' />}
          >
            {getFieldDecorator('remark', formRules.remark)(
              <TextArea rows={3}/>
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
export default ContactPersonForm;
