/*eslint-disable*/
import React, {Component, Fragment} from 'react';
import { Form, Input,Card,Button,Select } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
const FormItem = Form.Item;
const {TextArea}  = Input;
const Option = Select.Option;
@connect(({ craneModel, loading }) => ({
  craneModel,
  loading: loading.effects['craneModel/getModelEdit'],
}))
@Form.create()
class ModelForm extends Component {
  state = {
    loading:false,
    params:{
      craneFactoryId:null,
      craneModelId:null,
      craneModelName:null,
      craneType:null,
      slewGearNumber:null,
      slewGearModulus:null,
      slewLimitGearNumber:null,
      radiusDriveRatio:null,
      radiusFrame:null,
      heightDriveRatio:null,
      heightFrame:null,
      loadFrameType:null,
      remarks:null
    },
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(!!params && params.craneFactoryId){
      this.setState({
        params:{...this.state.params,...{craneFactoryId:params.craneFactoryId}}
      });
      if(params.craneModelId){
        this.setState({
          id:params.craneModelId
        },()=>{
          this.getEditData();
        });
      }
    }
  }
  /*获取单项数据*/
  getEditData = () => {
    this.props.dispatch({
      type: 'craneModel/getModelEdit',
      payload:{craneFactoryId:this.state.params.craneFactoryId,id:this.state.id},
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
        type: !!this.state.params.craneModelId ? 'craneModel/editModel' : 'craneModel/addModel',
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
      craneModelName:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.craneModelName
      },
      craneType:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.craneType
      },
      slewGearNumber:{
        rules:[{required: true,pattern:new RegExp(/^\d+$/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.slewGearNumber
      },
      slewGearModulus:{
        rules:[{required: true,pattern:new RegExp(/^\d+$/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.slewGearModulus
      },
      slewLimitGearNumber:{
        rules:[{required: true,pattern:new RegExp(/^\d+$/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.slewLimitGearNumber
      },
      radiusDriveRatio:{
        rules:[{required: true,pattern:new RegExp(/^\d+$/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.radiusDriveRatio
      },
      radiusFrame:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.radiusFrame
      },
      heightDriveRatio:{
        rules:[{required: true,pattern:new RegExp(/^\d+$/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.heightDriveRatio
      },
      heightFrame:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.radiusFrame
      },
      loadFrameType:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.loadFrameType
      },
      remarks:{
        initialValue:this.state.params.remarks
      }
    };
    return (
      <Card className='auto-overflow'>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.craneModel.craneModelName'})}
          >
            {getFieldDecorator('craneModelName', formRules.craneModelName)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.craneType'})}
          >
            {getFieldDecorator('craneType', formRules.craneType)(
              <Select>
                <Option value = {0}><FormattedMessage id = 'app.common.flat-crane'/></Option>
                <Option value = {1}><FormattedMessage id = 'app.common.movable-crane'/></Option>
                <Option value = {2}><FormattedMessage id = 'app.common.head-crane'/></Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id = 'app.craneModel.slewGearNumber'/>}
          >
            {getFieldDecorator('slewGearNumber', formRules.slewGearNumber)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id = 'app.craneModel.slewGearModulus'/>}
          >
            {getFieldDecorator('slewGearModulus', formRules.slewGearModulus)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id = 'app.craneModel.slewLimitGearNumber'/>}
          >
            {getFieldDecorator('slewLimitGearNumber', formRules.slewLimitGearNumber)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id = 'app.craneModel.radiusDriveRatio'/>}
          >
            {getFieldDecorator('radiusDriveRatio', formRules.radiusDriveRatio)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id = 'app.craneModel.radiusFrame'/>}
          >
            {getFieldDecorator('radiusFrame', formRules.radiusFrame)(
              <Select>
                <Option value = {0}><FormattedMessage id = 'app.craneModel.radius-commonFrame'/></Option>
                <Option value = {1}><FormattedMessage id = 'app.craneModel.radius-connectFrame'/></Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id = 'app.craneModel.heightDriveRatio'/>}
          >
            {getFieldDecorator('heightDriveRatio', formRules.heightDriveRatio)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id = 'app.craneModel.heightFrame'/>}
          >
            {getFieldDecorator('heightFrame', formRules.heightFrame)(
              <Select>
                <Option value = {0}><FormattedMessage id = 'app.craneModel.height-commonFrame'/></Option>
                <Option value = {1}><FormattedMessage id = 'app.craneModel.height-connectFrame'/></Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id = 'app.craneModel.loadFrameType'/>}
          >
            {getFieldDecorator('loadFrameType', formRules.loadFrameType)(
              <Select>
                <Option value = {0}><FormattedMessage id = 'app.craneModel.load-commonFrame'/></Option>
                <Option value = {1}><FormattedMessage id = 'app.craneModel.ping-frame'/></Option>
                <Option value = {2}><FormattedMessage id = 'app.craneModel.group-frame'/></Option>
                <Option value = {3}><FormattedMessage id = 'app.craneModel.plus-frame'/></Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id = 'app.common.remark'/>}
          >
            {getFieldDecorator('remarks', formRules.remarks)(
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
export default ModelForm;
