/*eslint-disable*/
import React, {Component, Fragment} from 'react';
import { Form, Input,Card,Button } from 'antd';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
import info from '@/defaultInfo'
import { formatMessage, FormattedMessage } from 'umi/locale';

const FormItem = Form.Item;
@connect(({ operator, loading }) => ({
  operator,
  loading: loading.effects['operator/getEdit'],
}))
@Form.create()
class OperatorForm extends Component {
  state = {
    loading:false,
    params:{
      workerId:null,
      workerName:null,
      identityNumber:null,
      telephone:null
    },
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.workerId){
      this.setState({id:params.workerId},()=>{
        this.getEditData();
      });
    }
  }

  /*获取单项数据*/
  getEditData = () => {
    this.props.dispatch({
      type: 'operator/getEdit',
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
      const {params} = this.state;
      this.setState({loading:true});
      this.props.dispatch({
        type: !!params.workerId ? 'operator/edit' : 'operator/add',
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
      workerName:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.workerName
      },
      identityNumber:{
        rules:[{required: true, pattern:new RegExp(/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.identityNumber
      },
      telephone:{
        rules:[{pattern:info.isSingapore ? new RegExp(/^\+65\d{8}$/):new RegExp(/(^(1[3-9][0-9])\d{8}$)|(^(0\d{2}-\d{8}(-\d{1,4})?)|(0\d{3}-\d{7,8}(-\d{1,4})?)$)/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.telephone
      },
    };
    return (
      <Card>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.operator.workerName'})}
          >
            {getFieldDecorator('workerName', formRules.workerName)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.operator.identityNumber'})}
          >
            {getFieldDecorator('identityNumber', formRules.identityNumber)(
              <Input disabled={!!this.state.id}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.phone'})}
          >
            {getFieldDecorator('telephone', formRules.telephone)(
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
export default OperatorForm;
