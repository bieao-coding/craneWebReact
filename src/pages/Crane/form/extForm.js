/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input, Card, Button, Select, DatePicker, Upload, Icon, message, Cascader, Switch } from 'antd';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
import { formatMessage, FormattedMessage } from 'umi/locale';
const FormItem = Form.Item;
@connect(({ crane, loading }) => ({
  crane,
  loading: loading.effects['crane/getSgpCraneExt'],
}))
@Form.create()
class ExtForm extends Component {
  state = {
    loading:false,
    isAdd:false,
    params:{
      craneId:null,
      isTest:0
    },
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params){
      if(params.craneId){
        this.setState({params:{...this.state.params,...{craneId:params.craneId}}},()=>{
          this.getEditData();
        });
      }
    }
  }
  /*获取单项数据*/
  getEditData = () => {
    this.props.dispatch({
      type: 'crane/getSgpCraneExt',
      payload:this.state.params.craneId,
      callback:(data)=>{
        if(!!data){
          this.setState({params:{...data,...{isTest:Boolean(data.isTest)}}})
        }else{
          this.setState({isAdd:true})
        }
      }
    })
  };
  // /*保存*/
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const {isAdd,params} = this.state;
      this.setState({loading:true});
      this.props.dispatch({
        type: isAdd ? 'crane/addSgpCraneExt' : 'crane/saveSgpCraneExt',
        payload:{...params,...{isTest:Number(values.isTest)}},
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
      isTest:{
        initialValue:this.state.params.isTest,
        valuePropName: 'checked'
      },
    };
    return (
      <div>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.crane.isTest'})}
          >
            {getFieldDecorator('isTest', formRules.isTest)(
              <Switch checkedChildren={formatMessage({id:'app.device.open'})} unCheckedChildren={formatMessage({id:'app.device.close'})} />
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
export default ExtForm;
