/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { Form, Input,Card,Button,Select  } from 'antd';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
import { formatMessage, FormattedMessage } from 'umi/locale';
import info from '@/defaultInfo';
const FormItem = Form.Item;
const Option = Select.Option;
@connect(({ project, loading }) => ({
  project,
  loading: loading.effects['project/getSgpExt'],
}))
@Form.create()
class ExtForm extends Component {
  index = 0;
  state = {
    loading:false,
    isAdd:false,
    params:{
      projectId:null,
      projectPhone:null,
    },
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.projectId){
      this.setState({params:{...this.state.params,...{projectId:params.projectId}}},()=>{
        this.getEditData();
      });
    }
  }

  /*获取单项数据*/
  getEditData = () => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'project/getSgpExt',
      payload:this.state.params.projectId,
      callback:(res)=>{
       if(!!res){
          this.setState({params:res})
       }else{
         this.setState({isAdd:true})
       }
      }
    })
  };
  /*保存*/
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const {isAdd} = this.state;
      this.setState({loading:true});
      this.props.dispatch({
        type: isAdd ? 'project/addSgpExt' : 'project/saveSgpExt',
        payload:{...this.state.params,...{projectPhone:'+65' + values.projectPhone}},
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
      projectPhone:{
        rules:[{pattern:new RegExp(/^\d{8}$/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.projectPhone
      },
    };
    return (
      <Card>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.projectPhone'})}
          >
            {getFieldDecorator('projectPhone', formRules.projectPhone)(
              <Input addonBefore="+65"/>
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout} className='m-b-10'>
            <Button type="primary" htmlType="submit" loading = {this.state.loading}>
              <FormattedMessage id='app.common.save' />
            </Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
};
export default ExtForm;
