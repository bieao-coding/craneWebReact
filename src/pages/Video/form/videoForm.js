/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { Form, Input,Card,Button } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
const FormItem = Form.Item;
@connect(({}) => ({
}))
@Form.create()
class VideoForm extends Component {
  state = {
    loading:false,
    params:{
      sn:null
    },
  };
  /*DOM加载完成后执行*/
  componentDidMount() {

  }
  // /*保存*/
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({loading:true});
      this.props.dispatch({
        type: 'videoList/add',
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
      sn:{
        rules:[{pattern:new RegExp(/^\d{12}$/),required:true, message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.sn
      }
    };
    // 编辑赋值
    return (
      <Card>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label="SN"
          >
            {getFieldDecorator('sn', formRules.sn)(
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
export default VideoForm;
