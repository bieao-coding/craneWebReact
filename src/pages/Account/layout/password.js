/*eslint-disable*/
import React, {Component, Fragment} from 'react';
import { Form, Input,Card,Button } from 'antd';
import {resMessage} from '@/utils/utils'
import { formatMessage,FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";

const FormItem = Form.Item;
@connect(({accountSetting}) => ({
  accountSetting
}))
@Form.create()
class Password extends Component {
  state = {
    loading:false,
    confirmDirty: false,
    auth:{},
    params:{
      oldPassword:null,
      newPassword:null,
    },
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
  }

  // /*保存*/
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({loading:true});
      const params = {oldPassword:values.oldPassword,newPassword:values.newPassword};
      this.props.dispatch({
        type: 'accountSetting/password',
        payload:{...this.state.params,...params},
        callback:(res) => {
          resMessage(res);
          this.setState({loading:false});
        }
      })
    });
  };
  /*确认密码焦点事件*/
  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  /*两次密码对比*/
  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('newPassword')) {
      callback(formatMessage({id:'app.account.passwordError'}));
    } else {
      callback();
    }
  };
  /*校验密码*/
  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['prePassword'], { force: true });
    }
    callback();
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
      oldPassword:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.oldPassword
      },
      newPassword:{
        rules:[{required: true,min:6,max:12, message: formatMessage({id:'app.account.newPassword'})},{validator: this.validateToNextPassword}],
        initialValue:this.state.params.newPassword
      },
      prePassword:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})},{validator: this.compareToFirstPassword}],
        initialValue:this.state.params.prePassword
      }
    };
    // 编辑赋值
    return (
      <div>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.account.input-oldPassword'})}
          >
            {getFieldDecorator('oldPassword', formRules.oldPassword)(
              <Input type="password"/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.account.input-newPassword'})}
          >
            {getFieldDecorator('newPassword', formRules.newPassword)(
              <Input type="password"/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.account.input-rePassword'})}
          >
            {getFieldDecorator('prePassword', formRules.prePassword)(
              <Input type="password" onBlur={this.handleConfirmBlur} />
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
export default Password;
