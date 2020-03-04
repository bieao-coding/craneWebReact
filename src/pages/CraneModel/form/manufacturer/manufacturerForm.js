/*eslint-disable*/
import React, {Component, Fragment} from 'react';
import { Form, Input,Card,Button } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
const FormItem = Form.Item;
const {TextArea}  = Input;
@connect(({ craneModel, loading }) => ({
  craneModel,
  loading: loading.effects['craneModel/getManufacturerEdit'],
}))
@Form.create()
class ManufacturerForm extends Component {
  state = {
    loading:false,
    params:{
      craneFactoryId:null,
      craneFactoryName:null,
      nation:null,
      description:null
    },
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.craneFactoryId){
      this.setState({id:params.craneFactoryId},()=>{
        this.getEditData();
      });
    }
  }
  /*获取单项数据*/
  getEditData = () => {
    this.props.dispatch({
      type: 'craneModel/getManufacturerEdit',
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
        type: !!this.state.params.craneFactoryId ? 'craneModel/editManufacturer' : 'craneModel/addManufacturer',
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
      craneFactoryName:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.craneFactoryName
      },
      nation:{
        initialValue:this.state.params.nation
      },
      description:{
        initialValue:this.state.params.description
      }
    };
    return (
      <Card>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.craneModel.factory'})}
          >
            {getFieldDecorator('craneFactoryName', formRules.craneFactoryName)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.craneModel.nation'})}
          >
            {getFieldDecorator('nation', formRules.nation)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.description'})}
          >
            {getFieldDecorator('description', formRules.description)(
              <TextArea rows={3}/>
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout} className='m-b-0'>
            <Button type="primary" htmlType="submit" loading = {this.state.loading}>
              <FormattedMessage id='app.common.save'/>
            </Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
};
export default ManufacturerForm;
