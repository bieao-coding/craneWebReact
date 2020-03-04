/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input,Card,Button } from 'antd';
import {resMessage} from '@/utils/utils'
import {connect} from "dva/index";
const FormItem = Form.Item;
@connect(({}) => ({
}))
@Form.create()
class Password extends Component {
  state = {
    loading:false,
    confirmDirty: false,
    params:{
      userId:null,
      oldPassword:null,
      newPassword:null,
    }
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.userId){
      this.setState({params:{...this.state.params,...{userId:params.userId}}});
    }
  }
  // /*保存*/
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err || !this.state.params.userId) return;
      this.setState({loading:true});
      const params = {oldPassword:values.oldPassword,newPassword:values.newPassword};
      this.props.dispatch({
        type: 'platformUser/password',
        payload:{...this.state.params,...params},
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
  /*确认密码焦点事件*/
  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  /*两次密码对比*/
  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('newPassword')) {
      callback('两次输入密码不一致');
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
        rules:[{required: true, message: '请输入旧密码'}],
        initialValue:this.state.params.oldPassword
      },
      newPassword:{
        rules:[{required: true,min:6,max:12, message: '请输入6~12位密码'},{validator: this.validateToNextPassword}],
        initialValue:this.state.params.newPassword
      },
      prePassword:{
        rules:[{required: true, message: '请再次输入密码'},{validator: this.compareToFirstPassword}],
        initialValue:this.state.params.prePassword
      }
    };
    // 编辑赋值
    return (
      <Card>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label="旧密码"
          >
            {getFieldDecorator('oldPassword', formRules.oldPassword)(
              <Input type="password"/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="新密码"
          >
            {getFieldDecorator('newPassword', formRules.newPassword)(
              <Input type="password"/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="确认密码"
          >
            {getFieldDecorator('prePassword', formRules.prePassword)(
              <Input type="password" onBlur={this.handleConfirmBlur} />
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" loading = {this.state.loading}>保存</Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
};
export default Password;
