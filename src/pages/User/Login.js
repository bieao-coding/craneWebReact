 /*eslint-disable*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Checkbox, Alert,Form,Input,Button } from 'antd';
import styles from './Login.less';
import ItemMap from './map';
import {getCookie,setCookie} from '@/utils/utils'
import { formatMessage, FormattedMessage,setLocale } from 'umi/locale';
import info from '@/defaultInfo';
const FormItem = Form.Item;
import $ from 'jquery';
@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
@Form.create()
class Login extends Component {
  state = {
    rememberPassword: false,
  };

  /*DOM加载完成后执行*/
  componentDidMount() {
    $('head title').text(formatMessage({id:'app.common.systemTitle'}));
    if(getCookie('username') && getCookie('password')){
      const name = getCookie('username');
      const password = getCookie('password');
      this.props.form.setFields({username:{value:name},password:{value:password}});
      this.setState({rememberPassword:true})
    }
  }

  onTabChange = type => {
    this.setState({ type });
  };

  handleSubmit = (e) => {
    e && e.preventDefault();
    const { dispatch } = this.props;
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.rememberPassword(values);
      dispatch({
        type: 'login/login',
        payload: values
      });
    });
  };
  /*处理记住密码*/
  rememberPassword(params){
    const {rememberPassword} = this.state;
    if(rememberPassword){
      setCookie('username', params.username, 7);
      setCookie('password', params.password, 7);
    }else{
      setCookie('username','',-1);
      setCookie('password','',-1);
    }
  }
  /*记住密码的change事件*/
  change = e => {
    this.setState({
      rememberPassword: e.target.checked,
    });
  };
  /*错误提示框*/
  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const { login, submitting } = this.props;
    const { rememberPassword } = this.state;
    const {UserName,Password} = ItemMap;
    const loginForm = this.props.form;
    const { getFieldDecorator } = loginForm;
    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit}>
          {login.status === 'Unauthorized' &&
          !submitting &&
          this.renderMessage(<FormattedMessage id="app.login.message-invalid-credentials" />)}
          <FormItem>
            {getFieldDecorator('username', {rules:UserName.rules})(<Input
              {...UserName.props}
              />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {rules:Password.rules})(<Input
              {...Password.props}
              />)}
          </FormItem>
          <div>
            <Checkbox checked={rememberPassword} onChange={this.change}>
              <FormattedMessage id="app.login.remember-password" />
            </Checkbox>
          </div>
          <FormItem>
            <Button size="large" loading={submitting} className={styles.submit} type="primary" htmlType="submit">
              <FormattedMessage id="app.login.login" />
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Login;
