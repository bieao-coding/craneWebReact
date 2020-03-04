/*eslint-disable*/
import React, {Component, Fragment} from 'react';
import { Form, Input,Card,Button } from 'antd';
import {connect} from "dva/index";
import { formatMessage, FormattedMessage } from 'umi/locale';
import {resMessage} from '@/utils/utils'

const FormItem = Form.Item;
const {TextArea}  = Input;
@connect(({ glodon, loading }) => ({
  glodon,
  loading: loading.effects['glodon/getEdit'],
}))
@Form.create()
class GlodonForm extends Component {
  state = {
    loading:false,
    params:{
      projectId:null,
      projectName:null,
      token:null
    }
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.projectId){
      this.setState({id:params.projectId},()=>{
        this.getEditData();
      });
    }
  }
  /*获取单项数据*/
  getEditData = () => {
    this.props.dispatch({
      type: 'glodon/getEdit',
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
        type:'glodon/edit',
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
      projectName:{
        initialValue:this.state.params.projectName
      },
      token:{
        initialValue:this.state.params.token
      }
    };
    // 编辑赋值
    return (
      <Card>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.common.projectName' />}
          >
            {getFieldDecorator('projectName', formRules.projectName)(
              <Input disabled={true}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='Token'
          >
            {getFieldDecorator('token', formRules.token)(
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
export default GlodonForm;
